import { ParseResult, ParamPatternResult, ZeroParamResult, OneParamResult, TwoParamResult } from '../core/params/definitions/types.ts';
import { ZeroParamsValidator } from './zero_params_validator.ts';
import { OneParamValidator } from './one_param_validator.ts';
import { TwoParamValidator } from './two_params_validator.ts';
import { ErrorFactory } from '../core/errors/error_factory.ts';
import { ValidatorFactory } from './validator_factory.ts';
import { ERROR_CODES, ERROR_CATEGORIES } from '../core/errors/constants.ts';

/**
 * InitialBranchValidator
 * Handles the initial branching logic for parameter validation
 */
export class InitialBranchValidator {
  private readonly zeroParamsValidator: ZeroParamsValidator;
  private readonly oneParamValidator: OneParamValidator;
  private readonly twoParamsValidator: TwoParamValidator;

  constructor() {
    const validatorFactory = ValidatorFactory.getInstance();
    this.zeroParamsValidator = validatorFactory.createZeroParamsValidator();
    this.oneParamValidator = validatorFactory.createOneParamValidator();
    this.twoParamsValidator = validatorFactory.createTwoParamsValidator();
  }

  validate(args: string[]): ParseResult<ParamPatternResult> {
    // Split arguments into options and non-options
    const { options, nonOptions } = this.splitArgs(args);

    // Create instances of all validators and get their results
    const zeroResult = this.zeroParamsValidator.validate(args);
    const oneResult = this.oneParamValidator.validate([nonOptions[0], ...options]);
    const twoResult = this.twoParamsValidator.validate([nonOptions[0], nonOptions[1], ...options]);

    // Use the validation result based on number of non-option arguments
    if (nonOptions.length === 0) {
      return {
        success: zeroResult.success,
        error: zeroResult.error,
        args,
        data: {
          ...zeroResult.data,
          type: 'zero'
        } as ZeroParamResult
      };
    } else if (nonOptions.length === 1) {
      return {
        success: oneResult.success,
        error: oneResult.error,
        args,
        data: {
          ...oneResult.data,
          type: 'one'
        } as OneParamResult
      };
    } else if (nonOptions.length === 2) {
      return {
        success: twoResult.success,
        error: twoResult.error,
        args,
        data: {
          ...twoResult.data,
          type: 'two'
        } as TwoParamResult
      };
    } else {
      // Too many arguments
      return {
        success: false,
        error: {
          message: 'Too many arguments. Maximum 2 arguments are allowed.',
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION,
          details: {
            provided: nonOptions.length,
            maxAllowed: 2
          }
        },
        args,
        data: {
          type: 'zero',
          help: false,
          version: false
        } as ZeroParamResult
      };
    }
  }

  /**
   * Split arguments into options and non-options
   * @param args Command line arguments
   * @returns Object containing options and non-options
   */
  private splitArgs(args: string[]): { options: string[]; nonOptions: string[] } {
    const options: string[] = [];
    const nonOptions: string[] = [];

    for (const arg of args) {
      if ((arg.startsWith('--') || arg.startsWith('-')) && arg.length > 1) {
        options.push(arg);
      } else {
        nonOptions.push(arg);
      }
    }

    return { options, nonOptions };
  }
} 