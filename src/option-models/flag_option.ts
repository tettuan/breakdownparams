import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { validateOptionFormat, validateEmptyValue } from './format_utils.ts';

export class FlagOption implements Option {
  readonly type = OptionType.FLAG;
  readonly isRequired = false;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string,
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

    // Flag options should not have values
    if (value !== undefined && !validateEmptyValue(value as string)) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Invalid option format: Flag options should not have values',
      };
    }

    return {
      isValid: true,
      validatedParams: [],
    };
  }

  parse(_value: unknown): undefined {
    return undefined;
  }
}
