import { ParseResult, ZeroParamResult } from '../definitions/types.ts';
import { BaseValidator } from '../../errors/validators/base_validator.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../../errors/constants.ts';

/**
 * Parser for commands with zero parameters
 */
export class ZeroParamsParser extends BaseValidator {
  /**
   * Validates arguments for a command with no parameters
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ZeroParamResult> {
    // help/versionフラグの判定
    const hasHelp = args.includes('--help') || args.includes('-h');
    const hasVersion = args.includes('--version') || args.includes('-v');
    const onlyFlags = args.every((arg) => ['--help', '--version', '-h', '-v'].includes(arg));

    if (args.length === 0 || onlyFlags) {
      return {
        success: true,
        data: {
          type: 'zero',
          help: hasHelp,
          version: hasVersion,
        },
        args,
      };
    }

    // 不正なオプションやカスタム変数はUNKNOWN_OPTIONで返す
    return {
      success: false,
      error: {
        message: 'No parameters expected (except --help or --version)',
        code: ERROR_CODES.UNKNOWN_OPTION,
        category: ERROR_CATEGORIES.SYNTAX,
      },
      args,
      data: {
        type: 'zero',
        help: false,
        version: false,
      },
    };
  }

  /**
   * Determines if this parser can handle the given arguments
   * @param args The arguments to check
   * @returns True if this parser can handle the arguments
   */
  canHandle(args: string[]): boolean {
    return args.length === 0;
  }
}
