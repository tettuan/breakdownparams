import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { validateOptionFormat, validateEmptyValue } from './format_utils.ts';

export class ValueOption implements Option {
  readonly type = OptionType.VALUE;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly isRequired: boolean,
    readonly description: string,
    private validator: (value: string) => ValidationResult,
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

    // Check required value
    if (this.isRequired && validateEmptyValue(value as string | undefined)) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `${this.name} is required`,
      };
    }

    // If value is provided, validate it
    if (value !== undefined && !validateEmptyValue(value as string)) {
      return this.validator(value as string);
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
