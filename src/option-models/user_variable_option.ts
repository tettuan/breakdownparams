import { OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { UserVariableOptionValidator } from '../validator/options/user_variable_option_validator.ts';
import { BaseOption } from './base_option.ts';

/**
 * UserVariableOption class for handling user variable options (--uv-*)
 * Following user_variable_options specifications:
 * - Only alphanumeric and underscore allowed
 * - Must start with a letter
 * - Case sensitive
 * - Must not be empty
 */
export class UserVariableOption extends BaseOption {
  readonly type = OptionType.USER_VARIABLE;
  readonly isRequired = false;
  readonly aliases: string[] = [];
  private readonly validator: UserVariableOptionValidator;
  private value?: string;

  constructor(
    readonly name: string,
    readonly description: string,
    rawInput: string = '',
  ) {
    // Initialize base option - user variables always use their full name with prefix
    super(rawInput || name, name, undefined);
    this.validator = new UserVariableOptionValidator();
    
    // Extract value from raw input if provided
    if (rawInput) {
      this.value = this.extractValue(rawInput);
    }
  }


  /**
   * Get the value for this user variable
   */
  getValue(): string {
    return this.value || '';
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
