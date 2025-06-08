import { ValidationResult } from "../result/types.ts";
import { TwoParamsConfig } from "../types/two_params_config.ts";

/**
 * Base interface for parameter validators
 */
export interface ParamsValidator {
  /**
   * Validate the parameters
   * @param args - Command line arguments
   * @param config - Configuration for validation rules (only used in TwoParamsValidator)
   * @returns ValidationResult containing validation results
   */
  validate(args: string[], config?: TwoParamsConfig): ValidationResult;
}

/**
 * Validator for zero parameters (help/version commands)
 */
export class ZeroParamsValidator implements ParamsValidator {
  validate(args: string[], config?: TwoParamsConfig): ValidationResult {
    const params = args.filter(arg => !arg.startsWith('--'));
    const isValid = params.length === 0;
    return {
      isValid,
      validatedParams: params,
      errorMessage: isValid ? undefined : 'Expected zero parameters',
      errorCode: isValid ? undefined : 'INVALID_PARAMS',
      errorCategory: isValid ? undefined : 'validation'
    };
  }
}

/**
 * Validator for one parameter (init command)
 */
export class OneParamValidator implements ParamsValidator {
  validate(args: string[], config?: TwoParamsConfig): ValidationResult {
    const params = args.filter(arg => !arg.startsWith('--'));
    if (params.length !== 1) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly one parameter',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation'
      };
    }

    const isValid = params[0] === 'init';
    return {
      isValid,
      validatedParams: params,
      demonstrativeType: params[0],
      errorMessage: isValid ? undefined : 'Invalid parameter. Only "init" is allowed',
      errorCode: isValid ? undefined : 'INVALID_PARAM',
      errorCategory: isValid ? undefined : 'validation'
    };
  }
}

/**
 * Validator for two parameters (main functionality)
 */
export class TwoParamValidator implements ParamsValidator {
  validate(args: string[], config?: TwoParamsConfig): ValidationResult {
    const params = args.filter(arg => !arg.startsWith('--'));
    if (params.length !== 2) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly two parameters',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation'
      };
    }

    const demonstrativePattern = config?.demonstrativeTypePattern || "^(to|summary|defect)$";
    const layerPattern = config?.layerTypePattern || "^(project|issue|task)$";
    const demonstrativeValid = new RegExp(demonstrativePattern).test(params[0]);
    const layerValid = new RegExp(layerPattern).test(params[1]);

    if (!demonstrativeValid || !layerValid) {
      return {
        isValid: false,
        validatedParams: params,
        demonstrativeType: params[0],
        layerType: params[1],
        errorMessage: !demonstrativeValid ? 'Invalid demonstrative type' : 'Invalid layer type',
        errorCode: !demonstrativeValid ? 'INVALID_DEMONSTRATIVE_TYPE' : 'INVALID_LAYER_TYPE',
        errorCategory: 'validation'
      };
    }

    return {
      isValid: true,
      validatedParams: params,
      demonstrativeType: params[0],
      layerType: params[1]
    };
  }
} 