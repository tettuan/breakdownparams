import { ParseResult, ZeroParamResult } from '../definitions/types.ts';
import { BaseValidator } from '../../errors/validators/base_validator.ts';
import { ERROR_CODES, ERROR_CATEGORIES } from '../../errors/constants.ts';

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
    const onlyFlags = args.every(arg => ['--help', '--version', '-h', '-v'].includes(arg));

    if (args.length === 0 || onlyFlags) {
      return {
        success: true,
        data: {
          type: 'zero',
          help: args.length === 0 ? true : hasHelp,
          version: hasVersion
        }
      };
    }

    // カスタム変数や不正なオプションのバリデーション
    for (const arg of args) {
      if (arg.startsWith('--uv-')) {
        // カスタム変数名バリデーション
        if (!/^--uv-[a-zA-Z0-9_\-]+(=.+)?$/.test(arg)) {
          return {
            success: false,
            error: this.createError(
              `Invalid custom variable name: ${arg}`,
              ERROR_CODES.VALIDATION_ERROR,
              ERROR_CATEGORIES.VALIDATION
            ),
            data: {
              type: 'zero',
              help: false,
              version: false
            }
          };
        }
        // 値が空や不正な場合
        if (!arg.includes('=') || arg.endsWith('=')) {
          return {
            success: false,
            error: this.createError(
              `Invalid custom variable format: ${arg}`,
              ERROR_CODES.VALIDATION_ERROR,
              ERROR_CATEGORIES.VALIDATION
            ),
            data: {
              type: 'zero',
              help: false,
              version: false
            }
          };
        }
      } else if (arg.startsWith('--') && !['--help', '--version'].includes(arg)) {
        // 不明なオプション
        return {
          success: false,
          error: this.createError(
            `Unknown option: ${arg}`,
            ERROR_CODES.VALIDATION_ERROR,
            ERROR_CATEGORIES.VALIDATION
          ),
          data: {
            type: 'zero',
            help: false,
            version: false
          }
        };
      }
    }

    // 不正なオプションやカスタム変数はVALIDATION_ERRORで返す
    return {
      success: false,
      error: this.createError(
        'No parameters expected (except --help or --version)',
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CATEGORIES.VALIDATION
      ),
      data: {
        type: 'zero',
        help: false,
        version: false
      }
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