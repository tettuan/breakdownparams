import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { CustomVariableValidator } from '../validator/options/custom_variable_validator.ts';

/**
 * CustomVariableOption class for handling custom variable options (--uv-*)
 * Following custom_variable_options.ja.md specifications:
 * - Only alphanumeric and underscore allowed
 * - Must start with a letter
 * - Case sensitive
 * - Must not be empty
 */
export class CustomVariableOption implements Option {
  readonly type = OptionType.CUSTOM_VARIABLE;
  readonly isRequired = false;
  readonly aliases: string[] = [];
  private readonly validator: CustomVariableValidator;

  constructor(
    readonly name: string,
    readonly description: string
  ) {
    this.validator = new CustomVariableValidator();
  }

  validate(value: unknown): ValidationResult {
    // Handle undefined value
    if (value === undefined) {
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    const strValue = value as string;

    // 1. Format Check: Basic structure validation
    if (!strValue.startsWith('--uv-')) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Option must start with --uv-',
      };
    }

    if (!strValue.includes('=')) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Invalid value format: Expected --uv-name=value',
      };
    }

    // 2. Extract variable name and value
    const [variableName] = strValue.split('=');
    const cleanVariableName = variableName.replace('--uv-', '');

    // 3. Delegate to validator for variable name validation
    return this.validator.validateVariableName(cleanVariableName);
  }

  parse(value: unknown): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    const strValue = value as string;
    if (strValue.includes('=')) {
      // Get everything after the first =
      return strValue.substring(strValue.indexOf('=') + 1);
    }
    return strValue;
  }
}
