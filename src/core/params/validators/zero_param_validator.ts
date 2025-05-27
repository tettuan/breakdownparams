import { ParseResult, ZeroParamResult } from '../types.ts';
import { ZeroParamValidator } from './types.ts';
import { BaseValidator } from './base_validator.ts';
import { ErrorFactory } from '../../errors/error_factory.ts';
import { ValidatorFactory } from './validator_factory.ts';
import { SecurityErrorValidator } from './types.ts';

/**
 * Validator for zero parameters case
 */
export class ZeroParamValidatorImpl extends BaseValidator implements ZeroParamValidator {
  private readonly securityValidator: SecurityErrorValidator;

  constructor() {
    super();
    this.securityValidator = ValidatorFactory.getInstance().createSecurityErrorValidator();
  }

  /**
   * Validates zero parameters
   * @param args The arguments to validate
   * @returns The validation result
   */
  validateZeroParams(args: string[]): ParseResult<ZeroParamResult> {
    const result: ZeroParamResult = {
      type: 'zero',
      help: args.includes('--help') || args.includes('-h'),
      version: args.includes('--version') || args.includes('-v'),
    };

    return this.createSuccessResult(result);
  }

  /**
   * Validates the parameter pattern
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ZeroParamResult> {
    return this.validateZeroParams(args);
  }

  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  canHandle(_args: string[]): boolean {
    // This validator can handle any arguments
    return true;
  }

  /**
   * Validates that there are no parameters
   * @param args The arguments to validate
   * @returns The validation result
   */
  validateNoParams(args: string[]): ParseResult<ZeroParamResult> {
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      return this.createSuccessResult({
        type: 'zero',
        help: true,
        version: false,
      });
    }

    // Check for version flag
    if (args.includes('--version') || args.includes('-v')) {
      return this.createSuccessResult({
        type: 'zero',
        help: false,
        version: true,
      });
    }

    // Check for other arguments
    if (args.length > 0) {
      // Check for security issues first
      const securityResult = this.securityValidator.validate(args);
      if (!securityResult.success) {
        return this.createErrorResult(securityResult.error!);
      }

      // Check for unknown options
      const unknownOptions = args.filter((arg) => arg.startsWith('-'));
      if (unknownOptions.length > 0) {
        return this.createErrorResult(ErrorFactory.createUnknownOption(unknownOptions[0]));
      }

      // If we get here, there are non-option arguments
      return this.createErrorResult(ErrorFactory.createInvalidCommand(args[0]));
    }

    return this.createSuccessResult({
      type: 'zero',
      help: false,
      version: false,
    });
  }
}
