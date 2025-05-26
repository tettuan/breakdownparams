import { ErrorCode, ErrorCategory } from './types.ts';

export const ERROR_CODES: Record<ErrorCode, ErrorCode> = {
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
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION'
};

export const ERROR_CATEGORIES: Record<ErrorCategory, ErrorCategory> = {
  SYNTAX: 'SYNTAX',
  VALIDATION: 'VALIDATION',
  SECURITY: 'SECURITY',
  CONFIGURATION: 'CONFIGURATION',
  BUSINESS: 'BUSINESS'
};

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: {
    INVALID_DEMONSTRATIVE_TYPE: (type: string) => 
      `Invalid demonstrative type: "${type}". Valid types are: to, summary, custom`,
    INVALID_LAYER_TYPE: (type: string) => 
      `Invalid layer type: "${type}". Valid types are: project, task, custom`,
    INVALID_OPTION_FORMAT: (option: string) => 
      `Invalid option format: "${option}". Options must be in the format --key=value`,
    INVALID_CUSTOM_VARIABLE: (name: string) => 
      `Invalid custom variable name: "${name}". Custom variables must start with --uv- and contain only alphanumeric characters and underscores`,
    EMPTY_OPTION_VALUE: (option: string) => 
      `Empty value for option: "${option}". Option values cannot be empty`,
    UNKNOWN_OPTION: (option: string) => 
      `Unknown option: "${option}". Valid options are: --from, --destination, --input, --adaptation, --config, and custom variables (--uv-*)`,
    SECURITY_ERROR: (details: string) => 
      `Security validation failed: ${details}. The command contains potentially unsafe characters or patterns`
  }
}; 