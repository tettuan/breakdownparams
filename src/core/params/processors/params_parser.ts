import { ParseResult, ParamPatternResult } from '../definitions/types.ts';
import { ZeroParamsParser } from './zero_params_parser.ts';
import { OneParamParser } from './one_param_parser.ts';
import { TwoParamsParser } from './two_params_parser.ts';
import { ERROR_CODES, ERROR_CATEGORIES } from '../../errors/constants.ts';
import { SecurityErrorValidator } from '../../errors/validators/security_error_validator.ts';

/**
 * Main parser for command line arguments
 */
export class ParamsParser {
  private readonly zeroParamsParser: ZeroParamsParser;
  private readonly oneParamParser: OneParamParser;
  private readonly twoParamsParser: TwoParamsParser;
  private readonly securityValidator: SecurityErrorValidator;
  private readonly validCommands: Set<string>;

  constructor() {
    this.zeroParamsParser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
    this.oneParamParser = new OneParamParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
    this.twoParamsParser = new TwoParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
    this.securityValidator = new SecurityErrorValidator();
    this.validCommands = new Set(['init', 'to', 'from', 'help', 'version']);
  }

  /**
   * Parses command line arguments
   * @param args The arguments to parse
   * @returns The parse result
   */
  parse(args: string[]): ParseResult<ParamPatternResult> {
    // First check for security issues
    const securityResult = this.securityValidator.validate(args);
    if (!securityResult.success) {
      return securityResult;
    }

    const nonOptionArgs = this.parseNonOptionArgs(args);

    // Validate command
    if (nonOptionArgs.length > 0 && !this.validCommands.has(nonOptionArgs[0])) {
      return {
        success: false,
        error: {
          message: `Invalid command: ${nonOptionArgs[0]}`,
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION
        },
        args
      };
    }

    if (nonOptionArgs.length === 0) {
      return this.zeroParamsParser.validate(args);
    }

    if (nonOptionArgs.length === 1) {
      return this.oneParamParser.validate(args);
    }

    if (nonOptionArgs.length === 2) {
      return this.twoParamsParser.validate(args);
    }

    if (nonOptionArgs.length > 2) {
      return {
        success: false,
        error: {
          message: 'Too many arguments. Maximum 2 arguments are allowed.',
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION
        },
        args
      };
    }

    return {
      success: false,
      error: {
        message: 'Invalid number of parameters',
        code: ERROR_CODES.VALIDATION_ERROR,
        category: ERROR_CATEGORIES.VALIDATION
      },
      args
    };
  }

  /**
   * Filters out non-option arguments from the input
   * @param args The arguments to filter
   * @returns The non-option arguments
   */
  private parseNonOptionArgs(args: string[]): string[] {
    return args.filter(arg => !arg.startsWith('-'));
  }
}
