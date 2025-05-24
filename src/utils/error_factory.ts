import { ErrorInfo, ErrorCode, ErrorCategory } from '../types.ts';

/**
 * ErrorFactory
 * エラー情報の生成を担当するユーティリティクラス
 */
export class ErrorFactory {
  static create(
    message: string,
    code: ErrorCode,
    category: ErrorCategory,
    details?: Record<string, unknown>,
  ): ErrorInfo {
    return {
      message,
      code,
      category,
      details,
    };
  }

  static createMissingRequiredArgument(field: string): ErrorInfo {
    return this.create(
      `Missing required argument: ${field}`,
      ErrorCode.MISSING_REQUIRED_ARGUMENT,
      ErrorCategory.VALIDATION,
      { field },
    );
  }

  static createInvalidCommand(command: string): ErrorInfo {
    return this.create(
      `Invalid command: ${command}`,
      ErrorCode.INVALID_COMMAND,
      ErrorCategory.VALIDATION,
      { provided: command },
    );
  }

  static createInvalidDemonstrativeType(type: string): ErrorInfo {
    return this.create(
      `Invalid demonstrative type: ${type}`,
      ErrorCode.INVALID_DEMONSTRATIVE_TYPE,
      ErrorCategory.VALIDATION,
      { provided: type },
    );
  }

  static createInvalidLayerType(type: string): ErrorInfo {
    return this.create(
      `Invalid layer type: ${type}`,
      ErrorCode.INVALID_LAYER_TYPE,
      ErrorCategory.VALIDATION,
      { provided: type },
    );
  }

  static createInvalidCustomVariable(name: string): ErrorInfo {
    return this.create(
      `Invalid custom variable name: ${name}`,
      ErrorCode.INVALID_CUSTOM_VARIABLE,
      ErrorCategory.VALIDATION,
      { provided: name },
    );
  }

  static createUnknownOption(option: string): ErrorInfo {
    return this.create(
      `Unknown option: ${option}`,
      ErrorCode.UNKNOWN_OPTION,
      ErrorCategory.VALIDATION,
      { provided: option },
    );
  }

  static createMissingValueForOption(option: string): ErrorInfo {
    return this.create(
      `Missing value for option: ${option}`,
      ErrorCode.MISSING_VALUE_FOR_OPTION,
      ErrorCategory.VALIDATION,
      { option },
    );
  }

  static createForbiddenCharacter(value: string, character: string): ErrorInfo {
    return this.create(
      `Forbidden character in value: ${character}`,
      ErrorCode.FORBIDDEN_CHARACTER,
      ErrorCategory.VALIDATION,
      { provided: value, character },
    );
  }
} 