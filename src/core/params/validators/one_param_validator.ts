import { ParseResult, ParamPatternResult, OneParamResult } from '../types.ts';
import { OneParamValidator } from './types.ts';
import { BaseValidator } from './base_validator.ts';
import { ErrorInfo } from '../../errors/types.ts';
import { ErrorFactory } from '../../errors/error_factory.ts';
import { ValidatorFactory } from './validator_factory.ts';
import { SecurityErrorValidator } from './types.ts';

/**
 * Validator for one parameter case
 */
export class OneParamValidatorImpl extends BaseValidator implements OneParamValidator {
  private readonly validCommands: Set<string>;
  private readonly securityValidator: SecurityErrorValidator;

  constructor() {
    super();
    this.validCommands = new Set(['init']);
    this.securityValidator = ValidatorFactory.getInstance().createSecurityErrorValidator();
  }

  /**
   * Validates one parameter
   * @param args The arguments to validate
   * @returns The validation result
   */
  validateOneParam(args: string[]): ParseResult<ParamPatternResult> {
    const command = args[0];
    const options = this.parseOptions(args.slice(1));

    if ('code' in options) {
      return this.createErrorResult(options as ErrorInfo);
    }

    if (!this.validCommands.has(command)) {
      return this.createErrorResult(ErrorFactory.createInvalidCommand(command));
    }

    const result: OneParamResult = {
      type: 'one',
      command,
      options
    };

    return this.createSuccessResult(result);
  }

  /**
   * Validates the parameter pattern
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ParamPatternResult> {
    return this.validateOneParam(args);
  }

  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  canHandle(args: string[]): boolean {
    // This validator can handle single non-option arguments
    const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
    return nonOptionArgs.length === 1;
  }

  /**
   * Parses options from command arguments
   * @param args The arguments to parse
   * @returns The parsed options or an error
   */
  protected override parseOptions(args: string[]): Record<string, string> | ErrorInfo {
    const options: Record<string, string> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (!arg.startsWith('-')) {
        continue;
      }

      const option = arg.startsWith('--') ? arg.slice(2) : arg.slice(1);
      const [key, value] = option.split('=');

      if (key === 'f' || key === 'from') {
        options.fromFile = value;
      } else if (key === 'o' || key === 'destination') {
        options.destinationFile = value;
      } else {
        options[key] = value;
      }
    }

    return options;
  }
} 