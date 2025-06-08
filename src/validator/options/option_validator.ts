import { ValidationResult } from "../../result/types.ts";
import { OptionRule } from "../../result/types.ts";

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
 * Validator for zero parameter options (help/version)
 */
export class ZeroOptionValidator implements OptionValidator {
  validate(args: string[], type: 'zero' | 'one' | 'two', optionRule: OptionRule): ValidationResult {
    const options = args.filter(arg => arg.startsWith('--'));
    const validOptions = Object.keys(optionRule.flagOptions);
    const invalidOptions = options.filter(opt => {
      const [key] = opt.slice(2).split('=');
      return !validOptions.includes(key);
    });

    if (invalidOptions.length > 0) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `Invalid options for zero parameters: ${invalidOptions.join(', ')}`,
        errorCode: 'INVALID_OPTIONS',
        errorCategory: 'validation'
      };
    }

    return {
      isValid: true,
      validatedParams: [],
      options: options.reduce((acc, opt) => {
        const [key] = opt.slice(2).split('=');
        acc[key] = undefined;
        return acc;
      }, {} as Record<string, unknown>)
    };
  }
}

/**
 * Validator for one parameter options (init)
 */
export class OneOptionValidator implements OptionValidator {
  validate(args: string[], type: 'zero' | 'one' | 'two', optionRule: OptionRule): ValidationResult {
    const options = args.filter(arg => arg.startsWith('--'));
    const validOptions = [
      ...Object.keys(optionRule.flagOptions),
      'from',
      'destination',
      'input',
      'adaptation'
    ];
    const invalidOptions = options.filter(opt => {
      const [key] = opt.slice(2).split('=');
      return !validOptions.includes(key) && !key.startsWith('uv-');
    });

    if (invalidOptions.length > 0) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `Invalid options for one parameter: ${invalidOptions.join(', ')}`,
        errorCode: 'INVALID_OPTIONS',
        errorCategory: 'validation'
      };
    }

    return {
      isValid: true,
      validatedParams: [],
      options: options.reduce((acc, opt) => {
        const [key, value] = opt.slice(2).split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, unknown>)
    };
  }
}

/**
 * Validator for two parameter options (main functionality)
 */
export class TwoOptionValidator implements OptionValidator {
  validate(args: string[], type: 'zero' | 'one' | 'two', optionRule: OptionRule): ValidationResult {
    const options = args.filter(arg => arg.startsWith('--'));
    const validOptions = [
      ...Object.keys(optionRule.flagOptions),
      'from',
      'destination',
      'input',
      'adaptation',
      'config'
    ];
    const invalidOptions = options.filter(opt => {
      const [key] = opt.slice(2).split('=');
      return !validOptions.includes(key) && !key.startsWith('uv-');
    });

    if (invalidOptions.length > 0) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `Invalid options for two parameters: ${invalidOptions.join(', ')}`,
        errorCode: 'INVALID_OPTIONS',
        errorCategory: 'validation'
      };
    }

    return {
      isValid: true,
      validatedParams: [],
      options: options.reduce((acc, opt) => {
        const [key, value] = opt.slice(2).split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, unknown>)
    };
  }
} 