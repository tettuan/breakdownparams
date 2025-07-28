/**
 * Format validation utilities for command line options.
 *
 * This module provides comprehensive validation functions for various
 * command-line option formats, ensuring consistency and correctness
 * according to the established specifications.
 *
 * @module format_utils
 */

/**
 * Validates the format of an option name.
 *
 * Option names must follow strict formatting rules:
 * - Only lowercase letters, numbers, and hyphens allowed
 * - Must start with a lowercase letter
 * - Cannot be empty
 * - Should not include the -- prefix
 *
 * @param name - The option name to validate (without -- prefix)
 * @returns Validation result with optional error message
 *
 * @example
 * ```ts
 * validateOptionName("verbose"); // { isValid: true }
 * validateOptionName("log-level"); // { isValid: true }
 * validateOptionName("2fa"); // { isValid: false, error: "Option name must start with a letter" }
 * validateOptionName("log_level"); // { isValid: false, error: "Option name can only contain..." }
 * ```
 */
export const validateOptionName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return {
      isValid: false,
      error: 'Option name cannot be empty',
    };
  }

  if (!/^[a-z]/.test(name)) {
    return {
      isValid: false,
      error: 'Option name must start with a letter',
    };
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      isValid: false,
      error: 'Option name can only contain lowercase letters, numbers, and hyphens',
    };
  }

  return { isValid: true };
};

/**
 * Validates long form option format.
 *
 * Long form options start with double dashes and may include values
 * using the equals syntax (--option=value).
 *
 * @param option - The option string to validate
 * @returns True if the format is valid
 *
 * @example
 * ```ts
 * validateLongFormOption("--verbose"); // true
 * validateLongFormOption("--config=app.json"); // true
 * validateLongFormOption("-v"); // false
 * validateLongFormOption("--invalid_option"); // false
 * ```
 */
export const validateLongFormOption = (option: string): boolean => {
  return /^--[a-z0-9-]+(?:=[^=]*)?$/.test(option);
};

/**
 * Validates short form option format.
 *
 * Short form options use a single dash followed by a single lowercase letter
 * and may include values using the equals syntax (-o=value).
 *
 * @param option - The option string to validate
 * @returns True if the format is valid
 *
 * @example
 * ```ts
 * validateShortFormOption("-v"); // true
 * validateShortFormOption("-c=app.json"); // true
 * validateShortFormOption("--verbose"); // false
 * validateShortFormOption("-V"); // false (uppercase not allowed)
 * ```
 */
export const validateShortFormOption = (option: string): boolean => {
  return /^-[a-z](?:=[^=]*)?$/.test(option);
};

/**
 * Validates empty value format for options.
 *
 * Empty values are allowed in specific formats to explicitly set
 * an option to an empty string. This is useful for clearing default values.
 *
 * Accepted formats:
 * - --option= (bare empty value)
 * - --option="" (empty double quotes)
 * - --option='' (empty single quotes)
 *
 * @param value - The value to validate
 * @returns True if the empty value format is valid
 *
 * @example
 * ```ts
 * validateEmptyValue(""); // true
 * validateEmptyValue('""'); // true
 * validateEmptyValue("''"); // true
 * validateEmptyValue("some value"); // false
 * ```
 */
export const validateEmptyValue = (value: string | undefined): boolean => {
  if (value === undefined) return true;
  return value === '' || value === '""' || value === "''";
};

/**
 * Validates user variable option format.
 *
 * User variable options use the --uv- prefix and follow strict naming rules:
 * - Variable names can only contain letters, numbers, and underscores
 * - Must start with a letter (uppercase or lowercase)
 * - Case sensitive (myVar !== myvar)
 * - Cannot be empty after the --uv- prefix
 *
 * @param option - The option string to validate (including --uv- prefix)
 * @returns True if the format is valid
 *
 * @example
 * ```ts
 * validateUserVariableOption("--uv-apiKey=value"); // true
 * validateUserVariableOption("--uv-max_retries=3"); // true
 * validateUserVariableOption("--uv-123invalid"); // false
 * validateUserVariableOption("--uv-_underscore"); // false
 * ```
 */
export const validateUserVariableOption = (option: string): boolean => {
  if (!option.startsWith('--uv-')) {
    return false;
  }
  // Extract variable name from option format (remove --uv- prefix)
  const [variableName] = option.split('=');
  const cleanVariableName = variableName.replace('--uv-', '');
  if (!cleanVariableName) {
    return false;
  }
  // Check if variable name starts with a letter and contains only allowed characters
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(cleanVariableName);
};

/**
 * Extracts key and value from an option string.
 *
 * Parses options in the format --key=value, returning the key without
 * the -- prefix and the value after the equals sign.
 *
 * @param option - The option string to parse
 * @returns Object containing the extracted key and value
 *
 * @example
 * ```ts
 * parseOption("--config=app.json"); // { key: "config", value: "app.json" }
 * parseOption("--verbose"); // { key: "verbose", value: undefined }
 * parseOption("--port=8080"); // { key: "port", value: "8080" }
 * ```
 */
export const parseOption = (option: string): { key: string; value: string | undefined } => {
  const [key, value] = option.slice(2).split('=');
  return { key, value };
};

/**
 * Validates complete option format according to specifications.
 *
 * This is a comprehensive validation function that checks:
 * - Proper prefix (must start with --)
 * - No space-separated values (must use = for values)
 * - No multiple equals signs
 * - Proper format for both standard and user variable options
 *
 * @param option - The complete option string to validate
 * @returns Validation result with optional error message
 *
 * @example
 * ```ts
 * validateOptionFormat("--verbose"); // { isValid: true }
 * validateOptionFormat("--config=app.json"); // { isValid: true }
 * validateOptionFormat("--uv-apiKey=abc123"); // { isValid: true }
 * validateOptionFormat("verbose"); // { isValid: false, error: "Option must start with --" }
 * validateOptionFormat("--config value"); // { isValid: false, error: "Space-separated format..." }
 * ```
 */
export const validateOptionFormat = (option: string): { isValid: boolean; error?: string } => {
  // Check if option starts with --
  if (!option.startsWith('--')) {
    return {
      isValid: false,
      error: 'Option must start with --',
    };
  }

  // Check for space-separated format (which is not allowed)
  if (option.includes(' ')) {
    return {
      isValid: false,
      error: 'Space-separated format is not supported',
    };
  }

  // Check for multiple = signs
  if ((option.match(/=/g) || []).length > 1) {
    return {
      isValid: false,
      error: 'Multiple = signs are not allowed',
    };
  }

  // For user variable options, use case-sensitive validation
  if (option.startsWith('--uv-')) {
    if (!validateUserVariableOption(option)) {
      return {
        isValid: false,
        error: 'Invalid user variable option format',
      };
    }
    return { isValid: true };
  }

  // For other options, use case-insensitive validation
  if (!validateLongFormOption(option)) {
    return {
      isValid: false,
      error: 'Invalid long form option format',
    };
  }

  return { isValid: true };
};
