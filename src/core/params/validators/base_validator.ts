import { ParseResult, ParamPatternResult } from '../types.ts';
import { ErrorInfo } from '../../errors/types.ts';

/**
 * Base class for parameter pattern validators
 */
export abstract class BaseValidator {
  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  abstract canHandle(args: string[]): boolean;

  /**
   * Creates a success result
   * @param data The data to include in the result
   * @returns The success result
   */
  protected createSuccessResult<T extends ParamPatternResult>(data: T): ParseResult<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Creates an error result
   * @param error The error to include in the result
   * @returns The error result
   */
  protected createErrorResult<T extends ParamPatternResult>(error: ErrorInfo): ParseResult<T> {
    return {
      success: false,
      error
    };
  }

  /**
   * Parses options from arguments
   * @param args The arguments to parse
   * @returns The parsed options or an error
   */
  protected parseOptions(args: string[]): Record<string, string> | ErrorInfo {
    const options: Record<string, string> = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        options[key] = value || '';
      } else if (arg.startsWith('-')) {
        const key = arg.slice(1);
        const value = args[i + 1]?.startsWith('-') ? '' : args[i + 1] || '';
        options[key] = value;
        if (value) i++;
      }
    }
    return options;
  }
} 