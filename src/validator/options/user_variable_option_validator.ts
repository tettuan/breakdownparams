import type { ValidationResult } from '../../types/validation_result.ts';

/**
 * Validator for user variable options (--uv-*)
 * Following user_variable_options specifications:
 * - Only alphanumeric and underscore allowed
 * - Must start with a letter
 * - Case sensitive
 * - Must not be empty
 */
export class UserVariableOptionValidator {
  /**
   * Default pattern for variable name validation
   * - Must start with a letter
   * - Can contain letters, numbers, and underscores
   */
  private static readonly DEFAULT_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

  /**
   * Validates a variable name
   * @param variableName The variable name to validate
   * @returns ValidationResult indicating if the variable name is valid
   */
  validateVariableName(variableName: string): ValidationResult {
    if (!variableName || !UserVariableOptionValidator.DEFAULT_PATTERN.test(variableName)) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Invalid variable name pattern',
      };
    }

    return {
      isValid: true,
      validatedParams: [],
    };
  }

  /**
   * Validates a user variable option value
   * @param value The value to validate
   * @returns ValidationResult indicating if the value is valid
   */
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

    // 2. Extract variable name
    const [variableName] = strValue.split('=');
    const cleanVariableName = variableName.replace('--uv-', '');

    // 3. Validation: Variable name rules
    if (
      !cleanVariableName || !UserVariableOptionValidator.DEFAULT_PATTERN.test(cleanVariableName)
    ) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Invalid variable name pattern',
      };
    }

    return {
      isValid: true,
      validatedParams: [],
    };
  }

  /**
   * Extracts the value part from a user variable option
   * @param value The value to parse
   * @returns The extracted value or undefined
   */
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
