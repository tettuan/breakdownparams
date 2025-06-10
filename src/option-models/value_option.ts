import { OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { validateOptionName } from './format_utils.ts';
import { BaseOption } from './base_option.ts';

export class ValueOption extends BaseOption {
  readonly type = OptionType.VALUE;
  private value?: string;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly isRequired: boolean,
    readonly description: string,
    readonly validator: (value: string) => ValidationResult,
    rawInput: string = '',
    longname?: string,
    shortname?: string,
  ) {
    // Initialize base option with long and short names
    super(rawInput || name, longname || name, shortname);

    // Extract value from raw input if provided
    if (rawInput) {
      this.value = this.extractValue(rawInput);
    }

    // Validate option name (remove -- prefix if present)
    const cleanName = name.startsWith('--') ? name.slice(2) : name;
    const nameValidation = validateOptionName(cleanName);
    if (!nameValidation.isValid) {
      throw new Error(`Invalid option name: ${nameValidation.error}`);
    }

    // Validate aliases
    for (const alias of aliases) {
      const cleanAlias = alias.startsWith('-') ? alias.slice(1) : alias;
      const aliasValidation = validateOptionName(cleanAlias);
      if (!aliasValidation.isValid) {
        throw new Error(`Invalid alias: ${aliasValidation.error}`);
      }
    }
  }

  /**
   * Get the value for this option
   */
  getValue(): string {
    return this.value || '';
  }

  validate(value: unknown): ValidationResult {
    // For value validation, we don't need to validate option format of name
    // The option name format is validated in constructor

    // Handle undefined value for optional options
    if (value === undefined) {
      if (this.isRequired) {
        return {
          isValid: false,
          validatedParams: [],
          errorMessage: 'Required value is missing',
        };
      }
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    // Extract value from option format
    const strValue = value as string;
    const actualValue = strValue.includes('=') ? strValue.split('=')[1] : strValue;

    // Handle empty value
    if (actualValue === '') {
      if (this.isRequired) {
        return {
          isValid: false,
          validatedParams: [],
          errorMessage: 'Value cannot be empty',
        };
      }
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    // Validate value using custom validator
    return this.validator(actualValue);
  }

  parse(value: unknown): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    const strValue = value as string;
    if (strValue.includes('=')) {
      return strValue.split('=')[1];
    }
    return strValue;
  }
}
