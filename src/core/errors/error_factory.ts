import { ErrorResult, ErrorCategory, ErrorCode } from '../params/definitions/types.ts';

type ErrorDetails = Record<string, unknown>;

export class ErrorFactory {
  static createConfigError(message: string, details?: ErrorDetails): ErrorResult {
    return {
      message,
      code: ErrorCode.INVALID_CONFIG,
      category: ErrorCategory.CONFIGURATION,
      details
    };
  }

  static createSecurityError(message: string, details?: ErrorDetails): ErrorResult {
    return {
      message,
      code: ErrorCode.SECURITY_ERROR,
      category: ErrorCategory.SECURITY,
      details
    };
  }

  static createValidationError(message: string, details?: ErrorDetails): ErrorResult {
    return {
      message,
      code: ErrorCode.INVALID_COMMAND,
      category: ErrorCategory.VALIDATION,
      details
    };
  }

  static createInvalidCustomVariable(arg: string): ErrorResult {
    return {
      message: `Invalid custom variable: ${arg}`,
      code: ErrorCode.INVALID_CUSTOM_VARIABLE,
      category: ErrorCategory.VALIDATION
    };
  }

  static createUnknownOption(arg: string): ErrorResult {
    return {
      message: `Unknown option: ${arg}`,
      code: ErrorCode.UNKNOWN_OPTION,
      category: ErrorCategory.SYNTAX
    };
  }

  static createMissingRequiredArgument(arg: string): ErrorResult {
    return {
      message: `Missing required argument: ${arg}`,
      code: ErrorCode.MISSING_REQUIRED_ARGUMENT,
      category: ErrorCategory.VALIDATION
    };
  }

  static createInvalidCommand(command: string): ErrorResult {
    return {
      message: `Invalid command: ${command}`,
      code: ErrorCode.INVALID_COMMAND,
      category: ErrorCategory.VALIDATION
    };
  }
} 