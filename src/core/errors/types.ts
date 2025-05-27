/**
 * Type representing error categories
 *
 * This type defines all possible error categories that can be used in the system.
 * Each category represents a specific type of error that can occur.
 *
 * @since 1.0.0
 */
export type ErrorCategory =
  | 'SYNTAX'
  | 'VALIDATION'
  | 'SECURITY'
  | 'CONFIGURATION'
  | 'BUSINESS';

/**
 * Type representing error codes
 *
 * This type defines all possible error codes that can be used in the system.
 * Each code represents a specific type of error that can occur.
 *
 * @since 1.0.0
 */
export type ErrorCode =
  | 'INVALID_COMMAND'
  | 'INVALID_DEMONSTRATIVE_TYPE'
  | 'INVALID_LAYER_TYPE'
  | 'INVALID_OPTION'
  | 'INVALID_CUSTOM_VARIABLE'
  | 'MISSING_REQUIRED_ARGUMENT'
  | 'UNKNOWN_OPTION'
  | 'MISSING_OPTION_VALUE'
  | 'CONFIGURATION_ERROR'
  | 'SECURITY_ERROR'
  | 'VALIDATION_ERROR'
  | 'INVALID_FORMAT'
  | 'MISSING_REQUIRED'
  | 'TYPE_MISMATCH'
  | 'VALUE_OUT_OF_RANGE'
  | 'SECURITY_VIOLATION'
  | 'BUSINESS_RULE_VIOLATION';

/**
 * Interface representing error information
 *
 * This interface defines the structure of error information that can be returned
 * by validators and other components in the system.
 *
 * @since 1.0.0
 */
export interface ErrorInfo {
  /** The error message */
  message: string;
  /** The error code */
  code: ErrorCode;
  /** The error category */
  category: ErrorCategory;
  /** Optional details about the error */
  details?: Record<string, unknown>;
}

/**
 * Type representing error result
 *
 * This type represents the result of an error that occurred during validation
 * or other operations in the system.
 *
 * @since 1.0.0
 */
export type ErrorResult = ErrorInfo;

/**
 * Interface representing the result of a process
 *
 * This interface defines the structure of the result of a process that can either
 * be successful or contain an error.
 *
 * @since 1.0.0
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
}

/**
 * Interface representing the result of a parameter process
 *
 * This interface extends the Result interface to include additional information
 * about the parameters used in the process.
 *
 * @since 1.0.0
 */
export interface ParamResult<T> extends Result<T> {
  args: string[];
}

/**
 * Interface representing the result of a parameter parsing process
 *
 * This interface extends the ParamResult interface to include an optional parse error.
 *
 * @since 1.0.0
 */
export interface ParseResult extends ParamResult<unknown> {
  error?: ParseError;
}

/**
 * Interface representing a parse error
 *
 * This interface extends the ErrorInfo interface to include additional information
 * about the position and expected value of the error.
 *
 * @since 1.0.0
 */
export interface ParseError extends ErrorInfo {
  position?: number;
  expected?: unknown;
}

/**
 * Interface representing the result of a validation process
 *
 * This interface extends the ParamResult interface to include an optional validation error.
 *
 * @since 1.0.0
 */
export interface ValidationResult extends ParamResult<unknown> {
  error?: ValidationError;
}

/**
 * Interface representing a validation error
 *
 * This interface extends the ErrorInfo interface to include additional information
 * about the provided and expected values of the error.
 *
 * @since 1.0.0
 */
export interface ValidationError extends ErrorInfo {
  provided?: string[];
  expected?: unknown;
}

/**
 * Interface representing the result of a business rule validation process
 *
 * This interface extends the ParamResult interface to include an optional business rule error.
 *
 * @since 1.0.0
 */
export interface BusinessRuleResult extends ParamResult<unknown> {
  error?: BusinessRuleError;
}

/**
 * Interface representing a business rule error
 *
 * This interface extends the ErrorInfo interface to include additional information
 * about the rule and context of the error.
 *
 * @since 1.0.0
 */
export interface BusinessRuleError extends ErrorInfo {
  rule: string;
  context?: unknown;
}

/**
 * Constant representing error codes
 *
 * This object defines all possible error codes that can be used in the system.
 * Each code is represented as a key-value pair in the object.
 *
 * @since 1.0.0
 */
export const ErrorCode = {
  INVALID_COMMAND: 'INVALID_COMMAND',
  INVALID_DEMONSTRATIVE_TYPE: 'INVALID_DEMONSTRATIVE_TYPE',
  INVALID_LAYER_TYPE: 'INVALID_LAYER_TYPE',
  INVALID_OPTION: 'INVALID_OPTION',
  INVALID_CUSTOM_VARIABLE: 'INVALID_CUSTOM_VARIABLE',
  MISSING_REQUIRED_ARGUMENT: 'MISSING_REQUIRED_ARGUMENT',
  UNKNOWN_OPTION: 'UNKNOWN_OPTION',
  MISSING_OPTION_VALUE: 'MISSING_OPTION_VALUE',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  SECURITY_ERROR: 'SECURITY_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  TYPE_MISMATCH: 'TYPE_MISMATCH',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
} as const;

/**
 * Constant representing error categories
 *
 * This object defines all possible error categories that can be used in the system.
 * Each category is represented as a key-value pair in the object.
 *
 * @since 1.0.0
 */
export const ErrorCategory = {
  SYNTAX: 'SYNTAX',
  VALIDATION: 'VALIDATION',
  SECURITY: 'SECURITY',
  CONFIGURATION: 'CONFIGURATION',
  BUSINESS: 'BUSINESS',
} as const;

/**
 * Type representing error codes
 *
 * This type represents the error codes defined in the ErrorCode constant.
 *
 * @since 1.0.0
 */
export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

/**
 * Type representing error categories
 *
 * This type represents the error categories defined in the ErrorCategory constant.
 *
 * @since 1.0.0
 */
export type ErrorCategoryType = typeof ErrorCategory[keyof typeof ErrorCategory];
