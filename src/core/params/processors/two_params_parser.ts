import { ParseResult, TwoParamResult, DEMONSTRATIVE_TYPES, LAYER_TYPES } from '../definitions/types.ts';
import { BaseValidator } from '../../errors/validators/base_validator.ts';
import { ERROR_CODES, ERROR_CATEGORIES, ERROR_MESSAGES } from '../../errors/constants.ts';
import { SecurityErrorValidator } from '../validators/security_error_validator.ts';
import { ErrorCode, ErrorCategory, ErrorInfo } from '../../errors/types.ts';

const OPTION_KEY_MAP: Record<string, string> = {
  from: 'fromFile',
  destination: 'destinationFile',
  input: 'fromLayerType',
  adaptation: 'adaptationType',
  config: 'configFile',
};

/**
 * Parser for commands with two parameters
 */
export class TwoParamsParser extends BaseValidator {
  private readonly securityValidator: SecurityErrorValidator;
  protected error?: ErrorInfo;

  constructor(errorCode: ErrorCode, errorCategory: ErrorCategory) {
    super(errorCode, errorCategory);
    this.securityValidator = new SecurityErrorValidator();
  }

  /**
   * Validates arguments for a command with two parameters
   * - Trims and lowercases parameters
   * - Checks against allowed types and for empty/invalid values
   * - Validates options and security
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<TwoParamResult> {
    const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
    const demonstrativeType = nonOptionArgs[0]?.trim().toLowerCase() ?? '';
    const layerType = nonOptionArgs[1]?.trim().toLowerCase() ?? '';

    // まず全てのオプションをパース
    const options: Record<string, string> = {};
    let hasHelp = false;
    let hasVersion = false;
    let optionFormatError: ErrorInfo | undefined = undefined;
    let customVariableError: ErrorInfo | undefined = undefined;
    let unknownOptionError: ErrorInfo | undefined = undefined;
    let optionValueError: ErrorInfo | undefined = undefined;
    let invalidOptionKey: string | undefined = undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--help') {
        hasHelp = true;
        continue;
      }
      if (arg === '--version') {
        hasVersion = true;
        continue;
      }
      if (arg.startsWith('--')) {
        // オプションフォーマットバリデーション
        if (!this.validateOptionFormat(arg)) {
          optionFormatError = this.error;
          // どのオプションでエラーか記録
          invalidOptionKey = arg.replace(/^--/, '').split('=')[0];
        }
        const [rawKey, value] = arg.replace(/^--/, '').split('=');
        if (!rawKey || value === undefined) continue;
        // カスタム変数バリデーション
        if (rawKey.startsWith('uv-')) {
          if (!this.validateCustomVariable(`--${rawKey}`)) {
            customVariableError = this.error;
            invalidOptionKey = rawKey;
          }
        } else {
          if (!this.validateUnknownOption(`--${rawKey}`)) {
            unknownOptionError = this.error;
            invalidOptionKey = rawKey;
          }
        }
        const key = OPTION_KEY_MAP[rawKey] || rawKey;
        options[key] = value;
      } else if (arg.startsWith('-') && arg.length === 2 && i + 1 < args.length) {
        const rawKey = arg[1];
        const value = args[i + 1];
        if (!value.startsWith('-')) {
          const key = OPTION_KEY_MAP[rawKey] || rawKey;
          options[key] = value;
          i++;
        }
      }
    }

    // オプション値バリデーション
    for (const [key, value] of Object.entries(options)) {
      if (!this.validateOptionValue(key, value)) {
        optionValueError = this.error;
        invalidOptionKey = key;
        break;
      }
    }

    // デモンストレイティブタイプバリデーション
    if (!this.validateDemonstrativeType(demonstrativeType)) {
      return {
        success: false,
        error: this.error,
        data: {
          type: 'two',
          demonstrativeType,
          layerType,
          options: { ...options, help: hasHelp, version: hasVersion }
        }
      };
    }
    // レイヤータイプバリデーション
    if (!this.validateLayerType(layerType)) {
      return {
        success: false,
        error: this.error,
        data: {
          type: 'two',
          demonstrativeType,
          layerType,
          options: { ...options, help: hasHelp, version: hasVersion }
        }
      };
    }
    // セキュリティバリデーション
    if (!this.validateSecurity(demonstrativeType) || !this.validateSecurity(layerType)) {
      return {
        success: false,
        error: this.error,
        data: {
          type: 'two',
          demonstrativeType,
          layerType,
          options: { ...options, help: hasHelp, version: hasVersion }
        }
      };
    }
    // オプションバリデーションエラーがあれば返す
    if (optionFormatError) {
      return {
        success: false,
        error: optionFormatError,
        data: {
          type: 'two',
          demonstrativeType,
          layerType,
          options: { ...options, help: hasHelp, version: hasVersion }
        }
      };
    }
    if (customVariableError) {
      return {
        success: false,
        error: customVariableError,
        data: {
          type: 'two',
          demonstrativeType,
          layerType,
          options: { ...options, help: hasHelp, version: hasVersion }
        }
      };
    }
    if (unknownOptionError) {
      return {
        success: false,
        error: unknownOptionError,
        data: {
          type: 'two',
          demonstrativeType,
          layerType,
          options: { ...options, help: hasHelp, version: hasVersion }
        }
      };
    }
    if (optionValueError) {
      return {
        success: false,
        error: optionValueError,
        data: {
          type: 'two',
          demonstrativeType,
          layerType,
          options: { ...options, help: hasHelp, version: hasVersion }
        }
      };
    }

    return {
      success: true,
      data: {
        type: 'two',
        demonstrativeType,
        layerType,
        options: {
          ...options,
          help: hasHelp,
          version: hasVersion
        }
      }
    };
  }

  /**
   * Determines if this parser can handle the given arguments
   * @param args The arguments to check
   * @returns True if this parser can handle the arguments
   */
  canHandle(args: string[]): boolean {
    return args.filter(arg => !arg.startsWith('-')).length === 2;
  }

  private validateDemonstrativeType(type: string): boolean {
    const normalizedType = type.toLowerCase();
    if (
      !DEMONSTRATIVE_TYPES.includes(normalizedType as typeof DEMONSTRATIVE_TYPES[number]) &&
      normalizedType !== 'custom' &&
      normalizedType !== 'help' &&
      normalizedType !== 'version'
    ) {
      this.error = this.createError(
        ERROR_MESSAGES.VALIDATION_ERROR.INVALID_DEMONSTRATIVE_TYPE(type),
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      );
      return false;
    }
    return true;
  }

  private validateLayerType(type: string): boolean {
    const normalizedType = type.toLowerCase();
    if (
      !LAYER_TYPES.includes(normalizedType as typeof LAYER_TYPES[number]) &&
      normalizedType !== 'custom' &&
      normalizedType !== 'help' &&
      normalizedType !== 'version'
    ) {
      this.error = this.createError(
        ERROR_MESSAGES.VALIDATION_ERROR.INVALID_LAYER_TYPE(type),
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      );
      return false;
    }
    return true;
  }

  private validateOptionFormat(option: string): boolean {
    if (!option.includes('=')) {
      this.error = this.createError(
        ERROR_MESSAGES.VALIDATION_ERROR.INVALID_OPTION_FORMAT(option),
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      );
      return false;
    }
    return true;
  }

  private validateCustomVariable(name: string): boolean {
    if (!name.startsWith('--uv-') || !/^[a-zA-Z0-9_-]+$/.test(name.slice(5))) {
      this.error = this.createError(
        ERROR_MESSAGES.VALIDATION_ERROR.INVALID_CUSTOM_VARIABLE(name),
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      );
      return false;
    }
    return true;
  }

  private validateOptionValue(option: string, value: string): boolean {
    if (value.trim() === '') {
      this.error = this.createError(
        ERROR_MESSAGES.VALIDATION_ERROR.EMPTY_OPTION_VALUE(option),
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      );
      return false;
    }
    return true;
  }

  private validateUnknownOption(option: string): boolean {
    const key = option.startsWith('--') ? option.slice(2) : option;
    const allowedKeys = [
      ...Object.keys(OPTION_KEY_MAP),
      ...Object.values(OPTION_KEY_MAP),
      'help',
      'version'
    ];
    if (!option.startsWith('--uv-') && !allowedKeys.includes(key)) {
      this.error = this.createError(
        ERROR_MESSAGES.VALIDATION_ERROR.UNKNOWN_OPTION(option),
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      );
      return false;
    }
    return true;
  }

  private validateSecurity(type: string): boolean {
    if (!this.securityValidator.validate([type])) {
      this.error = this.createError(
        ERROR_MESSAGES.VALIDATION_ERROR.SECURITY_ERROR(type),
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      );
      return false;
    }
    return true;
  }
} 