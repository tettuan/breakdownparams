/**
 * Format validation utilities for command line options
 * Based on options.ja.md specifications
 */

/**
 * Validates long form option format (--option=value)
 * @param option The option string to validate
 * @returns true if the format is valid
 */
export const validateLongFormOption = (option: string): boolean => {
  return /^--[a-z0-9-]+(?:=[^=]*)?$/.test(option);
};

/**
 * Validates short form option format (-o=value)
 * @param option The option string to validate
 * @returns true if the format is valid
 */
export const validateShortFormOption = (option: string): boolean => {
  return /^-[a-z](?:=[^=]*)?$/.test(option);
};

/**
 * Validates empty value format
 * Following options.ja.md specifications:
 * - --option=
 * - --option=""
 * - --option=''
 * @param value The value to validate
 * @returns true if the empty value format is valid
 */
export const validateEmptyValue = (value: string | undefined): boolean => {
  if (value === undefined) return true;
  return value === '' || value === '""' || value === "''";
};

/**
 * Validates custom variable option format (--uv-*)
 * Case-sensitive validation for custom variables
 * Following custom_variable_options.ja.md specifications:
 * - Only alphanumeric and underscore allowed
 * - Must start with a letter
 * - Case sensitive
 * - Must not be empty
 * @param option The option string to validate
 * @returns true if the format is valid
 */
export const validateCustomVariableOption = (option: string): boolean => {
  if (!option.startsWith('--uv-')) {
    return false;
  }
  // Extract variable name from option format (remove --uv- prefix)
  const [variableName] = option.split('=');
  const cleanVariableName = variableName.replace('--uv-', '');
  console.log('Extracted variable name:', cleanVariableName);
  if (!cleanVariableName) {
    return false;
  }
  // Check if variable name starts with a letter and contains only allowed characters
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(cleanVariableName);
};

/**
 * Extracts key and value from an option string
 * @param option The option string to parse
 * @returns Object containing key and value
 */
export const parseOption = (option: string): { key: string; value: string | undefined } => {
  const [key, value] = option.slice(2).split('=');
  return { key, value };
};

/**
 * Validates option format according to options.ja.md specifications
 * @param option The option string to validate
 * @returns Object containing validation result and error message if invalid
 */
export const validateOptionFormat = (option: string): { isValid: boolean; error?: string } => {
  // Check if option starts with --
  if (!option.startsWith('--')) {
    return {
      isValid: false,
      error: 'Option must start with --'
    };
  }

  // Check for space-separated format (which is not allowed)
  if (option.includes(' ')) {
    return {
      isValid: false,
      error: 'Space-separated format is not supported'
    };
  }

  // Check for multiple = signs
  if ((option.match(/=/g) || []).length > 1) {
    return {
      isValid: false,
      error: 'Multiple = signs are not allowed'
    };
  }

  // For custom variable options, use case-sensitive validation
  if (option.startsWith('--uv-')) {
    if (!validateCustomVariableOption(option)) {
      return {
        isValid: false,
        error: 'Invalid custom variable option format'
      };
    }
    return { isValid: true };
  }

  // For other options, use case-insensitive validation
  if (!validateLongFormOption(option)) {
    return {
      isValid: false,
      error: 'Invalid long form option format'
    };
  }

  return { isValid: true };
}; 