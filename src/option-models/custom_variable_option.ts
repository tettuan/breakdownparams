import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { validateOptionFormat, validateCustomVariableOption, validateEmptyValue } from './format_utils.ts';

export class CustomVariableOption implements Option {
  readonly type = OptionType.CUSTOM_VARIABLE;
  readonly isRequired = false;
  readonly aliases: string[] = [];

  constructor(
    readonly name: string,
    readonly description: string,
    private pattern: RegExp,
  ) {}

  validate(value: unknown): ValidationResult {
    // Validate option format
    const formatValidation = validateOptionFormat(this.name);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: formatValidation.error,
      };
    }

    // Validate custom variable format
    if (!validateCustomVariableOption(this.name)) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `Invalid custom variable name: ${this.name}`,
      };
    }

    // Validate pattern if value is provided
    if (value !== undefined && !validateEmptyValue(value as string)) {
      if (!this.pattern.test(value as string)) {
        return {
          isValid: false,
          validatedParams: [],
          errorMessage: `Invalid value for custom variable: ${value}`,
        };
      }
    }

    return {
      isValid: true,
      validatedParams: [],
    };
  }

  parse(value: unknown): string | undefined {
    return value as string | undefined;
  }
}
