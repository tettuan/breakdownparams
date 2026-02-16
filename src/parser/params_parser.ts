import { DEFAULT_OPTION_RULE, type OptionRule } from '../types/option_rule.ts';
import type {
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../types/params_result.ts';
import { SecurityValidator } from '../validator/security_validator.ts';
import { OptionCombinationValidator } from '../validator/options/option_combination_validator.ts';
// Parameter configuration is handled through CustomConfig
import { type CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../types/custom_config.ts';
import { ZeroParamsValidator } from '../validator/params/zero_params_validator.ts';
import { OneParamValidator } from '../validator/params/one_param_validator.ts';
import { TwoParamsValidator } from '../validator/params/two_params_validator.ts';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../validator/options/option_validator.ts';
import { CommandLineOptionFactory } from '../factories/option_factory.ts';

/**
 * Interface for parameter parser that processes command-line arguments.
 *
 * This interface defines the contract for parsing command-line arguments
 * into structured parameter results with proper validation.
 */
export interface ParamsParser {
  /**
   * Parses command-line arguments into a structured result.
   *
   * This method processes the raw command-line arguments and returns
   * a result object containing parsed parameters and options, or error
   * information if validation fails.
   *
   * @param args - Array of command-line arguments to parse
   * @returns Parsed result containing parameters, options, and validation status
   *
   * @example
   * ```ts
   * const parser = new ParamsParser();
   * const result = parser.parse(["layer", "detail", "--verbose"]);
   *
   * if (result.type === "two") {
   *   // result.directiveType === "layer"
   *   // result.layerType === "detail"
   *   // result.options.verbose === true
   * }
   * ```
   */
  parse(args: string[]): ParamsResult;
}

/**
 * Main parameter parser implementation that processes command-line arguments.
 *
 * This class handles the complete parsing workflow including:
 * - Security validation to prevent malicious input
 * - Parameter and option separation
 * - Parameter count validation (0, 1, or 2 parameters)
 * - Option validation based on parameter count
 * - Option combination validation
 *
 * @example
 * ```ts
 * // Basic usage with default configuration
 * const parser = new ParamsParser();
 * const result = parser.parse(Deno.args);
 *
 * // Custom configuration
 * const customParser = new ParamsParser(
 *   { allowedOptions: ["verbose", "help"] },
 *   { directiveType: ["layer"], layerType: ["detail"] }
 * );
 * ```
 */
export class ParamsParser {
  private readonly optionRule: OptionRule;
  private readonly customConfig: CustomConfig;
  /**
   * Security validator that checks for potentially harmful strings in parameters.
   * This validator ensures system safety by preventing injection attacks.
   */
  private readonly securityValidator: SecurityValidator;
  private readonly optionFactory: CommandLineOptionFactory;
  protected readonly zeroOptionCombinationValidator: OptionCombinationValidator;
  protected readonly oneOptionCombinationValidator: OptionCombinationValidator;
  protected readonly twoOptionCombinationValidator: OptionCombinationValidator;

  /**
   * Creates a new instance of ParamsParser with optional custom configuration.
   *
   * @param optionRule - Rules defining allowed options for different parameter counts
   * @param customConfig - Custom configuration for validation rules and behavior
   */
  constructor(optionRule?: OptionRule, customConfig?: CustomConfig) {
    this.optionRule = optionRule || DEFAULT_OPTION_RULE;
    this.customConfig = customConfig || DEFAULT_CUSTOM_CONFIG;

    this.securityValidator = new SecurityValidator();
    this.optionFactory = new CommandLineOptionFactory();

    // Use custom config for option combination rules
    const validationRules = this.customConfig.validation;
    this.zeroOptionCombinationValidator = new OptionCombinationValidator({
      allowedOptions: [
        ...validationRules.zero.allowedOptions,
        ...(validationRules.zero.allowedValueOptions || []),
      ],
    });
    this.oneOptionCombinationValidator = new OptionCombinationValidator({
      allowedOptions: [
        ...validationRules.one.allowedOptions,
        ...(validationRules.one.allowedValueOptions || []),
      ],
    });
    this.twoOptionCombinationValidator = new OptionCombinationValidator({
      allowedOptions: [
        ...validationRules.two.allowedOptions,
        ...(validationRules.two.allowedValueOptions || []),
      ],
    });
  }

  /**
   * Extracts options from command-line arguments using the option factory.
   *
   * This method processes arguments starting with '--' or '-' and converts them
   * into a normalized options object. It handles both flag options (boolean)
   * and value options (with associated values).
   *
   * @param args - Raw command-line arguments
   * @returns Object containing extracted options with normalized names
   * @throws Error if a flag option is given a value
   *
   * @example
   * ```ts
   * // Input: ["--verbose", "--config=test.json", "-h"]
   * // Output: { verbose: true, config: "test.json", help: true }
   * ```
   */
  private extractOptionsUsingFactory(args: string[]): Record<string, unknown> {
    const options: Record<string, unknown> = {};
    const optionArgs = args.filter((arg) => arg.startsWith('--') || arg.startsWith('-'));

    for (const arg of optionArgs) {
      try {
        const option = this.optionFactory.createOptionsFromArgs([arg])[0];
        if (option) {
          // Use the option's normalized name method
          const optionName = option.toNormalized();
          // Get the value from the option instance
          const value = option.getValue();
          options[optionName] = value;
        }
      } catch (error) {
        // Flag options with values should throw an error
        if (
          error instanceof Error && error.message.includes('Flag option') &&
          error.message.includes('should not have a value')
        ) {
          throw error;
        }
        // Ignore other invalid options
      }
    }

    return options;
  }

  /**
   * Parses command-line arguments with comprehensive validation.
   *
   * Processing flow:
   * 1. Security validation - Checks for potentially harmful strings
   * 2. Parameter/option separation - Distinguishes between parameters and options
   * 3. Parameter count validation - Validates 0, 1, or 2 parameters
   * 4. Option validation based on parameter count:
   *    - Option existence check
   *    - Option combination validation
   *
   * @param args - Array of command-line arguments to parse
   * @returns Structured result with parsed parameters and options or error information
   *
   * @example
   * ```ts
   * // Zero parameters with options
   * parser.parse(["--help"]); // { type: "zero", params: [], options: { help: true } }
   *
   * // One parameter
   * parser.parse(["init"]); // { type: "one", params: ["init"], directiveType: "init" }
   *
   * // Two parameters
   * parser.parse(["layer", "detail", "--verbose"]);
   * // { type: "two", params: ["layer", "detail"], directiveType: "layer", layerType: "detail" }
   *
   * // Error case
   * parser.parse(["invalid", "too", "many"]); // { type: "error", error: {...} }
   * ```
   */
  public parse(args: string[]): ParamsResult {
    // 1. Security check
    // Check for malicious strings that could compromise the system
    // No additional checks are needed beyond security validation
    const securityResult = this.securityValidator.validate(args);
    if (!securityResult.isValid) {
      return {
        type: 'error',
        params: [],
        options: {},
        error: {
          message: securityResult.errorMessage || 'Security error',
          code: securityResult.errorCode || 'SECURITY_ERROR',
          category: securityResult.errorCategory || 'security',
        },
      };
    }

    // 2. Separate parameters and options
    // Parameters are arguments that are not options
    // Options are arguments that start with -- or -
    const params = args.filter((arg) => !arg.startsWith('--') && !arg.startsWith('-'));

    let options: Record<string, unknown>;
    try {
      options = this.extractOptionsUsingFactory(args);
    } catch (error) {
      if (error instanceof Error) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: error.message,
            code: 'INVALID_OPTION_FORMAT',
            category: 'invalid_format',
          },
        };
      }
      throw error;
    }

    // 3. Parameter validation
    // Validate based on parameter count
    // Run all three validations simultaneously and check each result
    const zeroValidator = new ZeroParamsValidator();
    const oneValidator = new OneParamValidator();
    const twoValidator = new TwoParamsValidator(this.customConfig);

    const zeroResult = zeroValidator.validate(params);
    const oneResult = oneValidator.validate(params);
    const twoResult = twoValidator.validate(params);

    /*
     * 4. Option validation based on parameter count
     * 4.1. Zero parameters case
     */
    if (zeroResult.isValid && !oneResult.isValid && !twoResult.isValid) {
      // 4.1.1. Check option existence
      const optionValidator = new ZeroOptionValidator();
      const optionResult = optionValidator.validate(args, 'zero', this.optionRule);

      if (!optionResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: optionResult.errorMessage || 'Invalid options',
            code: optionResult.errorCode || 'INVALID_OPTIONS',
            category: optionResult.errorCategory || 'validation',
          },
        };
      }

      // 4.1.2. Check option combinations
      const zeroOptionCombinationResult = this.zeroOptionCombinationValidator.validate(options);

      if (!zeroOptionCombinationResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: zeroOptionCombinationResult.errorMessage || 'Invalid option combination',
            code: zeroOptionCombinationResult.errorCode || 'INVALID_OPTION_COMBINATION',
            category: zeroOptionCombinationResult.errorCategory || 'validation',
          },
        };
      }

      return {
        type: 'zero',
        params: [],
        options,
      } as ZeroParamsResult;
    }

    /*
     * 4.2. One parameter case
     */
    if (!zeroResult.isValid && oneResult.isValid && !twoResult.isValid) {
      // 4.2.1. Check option existence
      const optionValidator = new OneOptionValidator();
      const optionResult = optionValidator.validate(args, 'one', this.optionRule);

      if (!optionResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: optionResult.errorMessage || 'Invalid options',
            code: optionResult.errorCode || 'INVALID_OPTIONS',
            category: optionResult.errorCategory || 'validation',
          },
        };
      }

      // 4.2.2. Check option combinations
      const oneOptionCombinationResult = this.oneOptionCombinationValidator.validate(options);

      if (!oneOptionCombinationResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: oneOptionCombinationResult.errorMessage || 'Invalid option combination',
            code: oneOptionCombinationResult.errorCode || 'INVALID_OPTION_COMBINATION',
            category: oneOptionCombinationResult.errorCategory || 'validation',
          },
        };
      }

      return {
        type: 'one',
        params: oneResult.validatedParams,
        options,
        directiveType: oneResult.validatedParams[0],
      } as OneParamsResult;
    }

    /*
     * 4.3. Two parameters case
     */
    if (!zeroResult.isValid && !oneResult.isValid && twoResult.isValid) {
      // 4.3.1. Check option existence
      const optionValidator = new TwoOptionValidator();
      const optionResult = optionValidator.validate(args, 'two', this.optionRule);

      if (!optionResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: optionResult.errorMessage || 'Invalid options',
            code: optionResult.errorCode || 'INVALID_OPTIONS',
            category: optionResult.errorCategory || 'validation',
          },
        };
      }

      // 4.3.2. Check option combinations
      const twoOptionCombinationResult = this.twoOptionCombinationValidator.validate(options);

      if (!twoOptionCombinationResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: twoOptionCombinationResult.errorMessage || 'Invalid option combination',
            code: twoOptionCombinationResult.errorCode || 'INVALID_OPTION_COMBINATION',
            category: twoOptionCombinationResult.errorCategory || 'validation',
          },
        };
      }

      return {
        type: 'two',
        params: twoResult.validatedParams,
        options,
        directiveType: twoResult.validatedParams[0],
        layerType: twoResult.validatedParams[1],
      } as TwoParamsResult;
    }

    /*
     * If parameter validation fails, return appropriate error based on parameter count
     */
    // Determine which validator's error to use based on parameter count
    let errorMessage: string | undefined;
    let errorCode: string | undefined;
    let errorCategory: string | undefined;

    if (params.length === 0) {
      // Zero parameters case - only options are allowed
      errorMessage = 'No command specified. Use --help for usage information';
      errorCode = 'NO_COMMAND';
      errorCategory = 'validation';
    } else if (params.length === 1) {
      // One parameter case - use OneParamValidator's error
      errorMessage = oneResult.errorMessage || 'Invalid command';
      errorCode = oneResult.errorCode || 'INVALID_COMMAND';
      errorCategory = oneResult.errorCategory || 'validation';
    } else if (params.length === 2) {
      // Two parameters case - use TwoParamsValidator's error
      errorMessage = twoResult.errorMessage || 'Invalid parameters';
      errorCode = twoResult.errorCode || 'INVALID_PARAMS';
      errorCategory = twoResult.errorCategory || 'validation';
    } else {
      // Three or more parameters case - too many arguments error
      errorMessage = 'Too many arguments. Maximum 2 arguments are allowed';
      errorCode = 'TOO_MANY_ARGS';
      errorCategory = 'validation';
    }

    return {
      type: 'error',
      params: [],
      options: {},
      error: {
        message: errorMessage,
        code: errorCode,
        category: errorCategory,
      },
    };
  }
}
