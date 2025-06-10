import { OptionRule } from '../../types/option_rule.ts';
import { ValidationResult } from '../../types/validation_result.ts';
import { debug } from '../../utils/logger.ts';

/**
 * Error messages for option validation
 */
const ERROR_MESSAGES = {
  INVALID_TYPE: (type: string) => `Invalid parameter type for this validator: ${type}`,
  INVALID_OPTIONS: (type: string, options: string[]) =>
    `Invalid options for ${type} parameters: ${options.join(', ')}`,
  EMPTY_VALUE: (option: string) => `Empty value not allowed for option: ${option}`,
} as const;

/**
 * Base interface for option validators
 */
export interface OptionValidator {
  /**
   * Validate the options
   * @param args - Command line arguments
   * @param type - Parameter type ('zero', 'one', or 'two')
   * @param optionRule - Rules for option validation
   * @returns ValidationResult containing validation results
   */
  validate(args: string[], type: 'zero' | 'one' | 'two', optionRule: OptionRule): ValidationResult;
}

/**
 * Base class for option validators
 */
abstract class BaseOptionValidator implements OptionValidator {
  protected abstract readonly paramType: 'zero' | 'one' | 'two';
  protected abstract readonly validOptions: string[];
  protected abstract readonly allowCustomVariables: boolean;

  /**
   * Normalize an option string into key and value
   */
  protected static normalizeOption(option: string): { key: string; value: string | undefined } {
    const [key, value] = option.slice(2).split('=');
    return { key, value };
  }

  /**
   * Validate options against allowed options
   */
  protected static validateOptions(
    options: string[],
    validOptions: string[],
    flagOptions: Record<string, boolean>,
    allowCustomVariables: boolean,
  ): { isValid: boolean; invalidOptions: string[] } {
    const invalidOptions = options.filter((opt) => {
      const { key } = this.normalizeOption(opt);
      return !validOptions.includes(key) && !Object.keys(flagOptions).includes(key) &&
        (!allowCustomVariables || !key.startsWith('uv-'));
    });
    return {
      isValid: invalidOptions.length === 0,
      invalidOptions,
    };
  }

  /**
   * Create an error validation result
   */
  protected createError(message: string, code: string): ValidationResult {
    return {
      isValid: false,
      validatedParams: [],
      errorMessage: message,
      errorCode: code,
      errorCategory: 'validation',
    };
  }

  /**
   * Create a success validation result
   */
  protected createSuccess(options: string[], optionRule: OptionRule): ValidationResult {
    return {
      isValid: true,
      validatedParams: [],
      options: options.reduce((acc, opt) => {
        const { key, value } = BaseOptionValidator.normalizeOption(opt);
        if (Object.keys(optionRule.flagOptions).includes(key)) {
          acc[key] = true;
        } else if (value === undefined) {
          acc[key] = true;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>),
    };
  }

  /**
   * Validate the options
   */
  validate(args: string[], type: string, optionRule: OptionRule): ValidationResult {
    debug('OptionValidator', 'Start validating options', { args, type, optionRule });

    // Type check
    if (type !== this.paramType) {
      debug('OptionValidator', 'Invalid parameter type', {
        expected: this.paramType,
        actual: type,
      });
      return this.createError(
        ERROR_MESSAGES.INVALID_TYPE(type),
        'INVALID_PARAMETER_TYPE',
      );
    }

    const options = args.filter((arg) => arg.startsWith('--'));
    debug('OptionValidator', 'Filtered options', options);

    // オプションがない場合は成功とする
    if (options.length === 0) {
      debug('OptionValidator', 'No options found, returning success');
      return this.createSuccess([], optionRule);
    }

    // 空の値のチェック
    const emptyValueOptions = options.filter((opt) => {
      const { key, value } = BaseOptionValidator.normalizeOption(opt);
      return !Object.keys(optionRule.flagOptions).includes(key) && value === '';
    });

    if (emptyValueOptions.length > 0) {
      debug('OptionValidator', 'Empty value options found', emptyValueOptions);
      return this.createError(
        ERROR_MESSAGES.EMPTY_VALUE(emptyValueOptions[0]),
        'INVALID_OPTIONS',
      );
    }

    const { isValid, invalidOptions } = BaseOptionValidator.validateOptions(
      options,
      [...this.validOptions, ...Object.keys(optionRule.flagOptions)],
      optionRule.flagOptions,
      this.allowCustomVariables,
    );
    debug('OptionValidator', 'Options validation result', { isValid, invalidOptions });

    if (!isValid) {
      debug('OptionValidator', 'Invalid options found, returning error');
      return this.createError(
        ERROR_MESSAGES.INVALID_OPTIONS(this.paramType, invalidOptions),
        'INVALID_OPTIONS',
      );
    }

    debug('OptionValidator', 'All options valid, returning success');
    return this.createSuccess(options, optionRule);
  }
}

/**
 * Validator for zero parameter options (help/version)
 */
export class ZeroOptionValidator extends BaseOptionValidator {
  protected readonly paramType = 'zero' as const;
  protected readonly validOptions = [];
  protected readonly allowCustomVariables = false;
}

/**
 * Validator for one parameter options (init)
 */
export class OneOptionValidator extends BaseOptionValidator {
  protected readonly paramType = 'one' as const;
  protected readonly validOptions = [];
  protected readonly allowCustomVariables = false;
}

/**
 * Validator for two parameter options (main functionality)
 */
export class TwoOptionValidator extends BaseOptionValidator {
  protected readonly paramType = 'two' as const;
  protected readonly validOptions = [
    'from',
    'destination',
    'input',
    'adaptation',
    'config',
  ];
  protected readonly allowCustomVariables = true;
}
