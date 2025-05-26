import { ErrorResult, ErrorCategory, ErrorCode, ErrorInfo } from './types.ts';

type ErrorDetails = Record<string, unknown>;

/**
 * Factory for creating error objects
 */
export class ErrorFactory {
  /**
   * Creates an error for invalid command
   * @param command The invalid command
   * @returns Error info object
   */
  public static createInvalidCommand(command: string): ErrorResult {
    return {
      message: `Invalid command: ${command}. Must be one of: init`,
      code: 'INVALID_COMMAND',
      category: 'SYNTAX',
      details: { 
        provided: command,
        validCommands: ['init']
      }
    };
  }

  /**
   * Creates an error for invalid demonstrative type
   * @param type The invalid demonstrative type
   * @returns Error info object
   */
  public static createInvalidDemonstrativeType(type: string): ErrorResult {
    return {
      message: `Invalid demonstrative type: ${type}`,
      code: 'INVALID_DEMONSTRATIVE_TYPE',
      category: 'SYNTAX',
      details: { provided: type }
    };
  }

  /**
   * Creates an error for invalid layer type
   * @param type The invalid layer type
   * @returns Error info object
   */
  public static createInvalidLayerType(type: string): ErrorResult {
    return {
      message: `Invalid layer type: ${type}`,
      code: 'INVALID_LAYER_TYPE',
      category: 'SYNTAX',
      details: { provided: type }
    };
  }

  /**
   * Creates an error for invalid option
   * @param option The invalid option
   * @returns Error info object
   */
  public static createInvalidOption(option: string): ErrorResult {
    return {
      message: `Invalid option: ${option}`,
      code: 'INVALID_OPTION',
      category: 'SYNTAX',
      details: { provided: option }
    };
  }

  /**
   * Creates an error for invalid custom variable
   * @param variable The invalid custom variable
   * @returns Error info object
   */
  public static createInvalidCustomVariable(variable: string): ErrorResult {
    return {
      message: `Invalid custom variable: ${variable}`,
      code: 'INVALID_CUSTOM_VARIABLE',
      category: 'SYNTAX',
      details: { provided: variable }
    };
  }

  /**
   * Creates an error for missing required argument
   * @param argument The missing argument name
   * @returns Error info object
   */
  public static createMissingRequiredArgument(argument: string): ErrorResult {
    return {
      message: `Missing required argument: ${argument}`,
      code: 'MISSING_REQUIRED_ARGUMENT',
      category: 'SYNTAX',
      details: { argument }
    };
  }

  /**
   * Creates an error for unknown option
   * @param option The unknown option
   * @returns Error info object
   */
  public static createUnknownOption(option: string): ErrorResult {
    return {
      message: `Unknown option: ${option}`,
      code: 'UNKNOWN_OPTION',
      category: 'SYNTAX',
      details: { provided: option }
    };
  }

  /**
   * Creates an error for missing option value
   * @param option The option that is missing a value
   * @returns Error info object
   */
  public static createMissingOptionValue(option: string): ErrorResult {
    return {
      message: `Missing value for option: ${option}`,
      code: 'MISSING_OPTION_VALUE',
      category: 'SYNTAX',
      details: { provided: option }
    };
  }

  /**
   * Creates a configuration error
   * @param message The error message
   * @param details Optional error details
   * @returns Error info object
   */
  public static createConfigError(message: string, details?: ErrorDetails): ErrorResult {
    return {
      message,
      code: 'CONFIGURATION_ERROR',
      category: 'CONFIGURATION',
      details
    };
  }

  /**
   * Creates a security error
   * @param message The error message
   * @param details Optional error details
   * @returns Error info object
   */
  public static createSecurityError(message: string, details?: ErrorDetails): ErrorResult {
    return {
      message,
      code: 'SECURITY_ERROR',
      category: 'SECURITY',
      details
    };
  }

  /**
   * Creates a validation error
   * @param message The error message
   * @param details Optional error details
   * @returns Error info object
   */
  public static createValidationError(message: string, details?: ErrorDetails): ErrorResult {
    return {
      message,
      code: 'VALIDATION_ERROR',
      category: 'VALIDATION',
      details
    };
  }
} 