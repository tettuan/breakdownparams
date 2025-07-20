/**
 * Comprehensive validation result interface for parameter and option validation.
 *
 * This interface serves as the communication contract between validators and
 * the parser, providing both success and failure information in a unified structure.
 * It supports partial results, allowing validators to return as much valid
 * information as possible even when errors occur.
 *
 * The design enables validators to:
 * - Report multiple validation errors at once
 * - Provide validated/transformed parameter values
 * - Include semantic type information discovered during validation
 * - Maintain consistency across different validation layers
 */
export interface ValidationResult {
  /**
   * Indicates whether validation passed all checks.
   *
   * When true, the validatedParams array contains the processed parameters
   * ready for use. When false, error fields will contain details about
   * validation failures.
   */
  isValid: boolean;
  /**
   * Array of parameters after validation and potential transformation.
   *
   * Contains parameters that have been validated and possibly normalized,
   * transformed, or enriched during the validation process. Even when
   * validation fails, this may contain partially validated results.
   */
  validatedParams: string[];
  /**
   * Primary human-readable error message.
   *
   * Provides the main error description when validation fails. Should be
   * user-friendly and actionable, explaining what went wrong and possibly
   * how to fix it.
   */
  errorMessage?: string;
  /**
   * Machine-readable error code for programmatic handling.
   *
   * Stable identifier for the type of validation error, enabling automated
   * error handling, internationalization, and documentation references.
   * Examples: 'MISSING_REQUIRED', 'INVALID_FORMAT', 'OUT_OF_RANGE'
   */
  errorCode?: string;
  /**
   * Categorization of the error type.
   *
   * Groups related errors for better error handling strategies.
   * Common categories: 'syntax', 'semantic', 'security', 'business_rule'
   */
  errorCategory?: string;
  /**
   * Detailed list of all validation errors encountered.
   *
   * When multiple validation issues exist, this array contains all error
   * messages, allowing comprehensive error reporting. Useful for form-like
   * validations where multiple fields may have issues.
   */
  errors?: string[];
  /**
   * Validated option values discovered during parameter validation.
   *
   * Some validators may process options as part of their validation logic.
   * This field allows them to return validated option values, maintaining
   * consistency across the validation pipeline.
   */
  options?: Record<string, unknown>;
  /**
   * Semantic type classification of the first parameter.
   *
   * Validators may determine the directive type during validation
   * (e.g., recognizing a parameter as a 'file', 'url', or 'identifier').
   * This information enriches the parsing result for type-aware processing.
   */
  directiveType?: string;
  /**
   * Semantic type classification of the second parameter.
   *
   * Similar to directiveType but for the second parameter in two-parameter
   * commands. Helps establish the relationship between parameters
   * (e.g., 'source' and 'destination').
   */
  layerType?: string;
}
