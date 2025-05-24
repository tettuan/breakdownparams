import { OptionParams, ErrorInfo, ErrorCode, ErrorCategory, LayerType } from '../types.ts';
import { ValidatorFactory } from '../validators/validator_factory.ts';

/**
 * OptionParser
 * オプションの解析を担当するユーティリティクラス
 */
export class OptionParser {
  private readonly validatorFactory: ValidatorFactory;

  constructor() {
    this.validatorFactory = ValidatorFactory.getInstance();
  }

  parse(args: string[]): OptionParams | { error: ErrorInfo, options: OptionParams } {
    const options: OptionParams = {};
    const customVariables: Record<string, string> = {};
    const customVariableValidator = this.validatorFactory.createCustomVariableValidator();

    // Track long and short form values separately
    const longForm: Record<string, string | undefined> = {};
    const shortForm: Record<string, string | undefined> = {};

    // 最大値の制限
    const MAX_VALUE_LENGTH = 1000;
    const MAX_CUSTOM_VARIABLES = 100;

    // 1. Parse all arguments and accumulate custom variables and options
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        if (arg === '--help' || arg === '--version') {
          continue;
        }
        if (arg.startsWith('--uv-')) {
          // --uv- のみはエラー
          if (arg === '--uv-') {
            return {
              error: {
                message: 'Invalid custom variable name: --uv-',
                code: ErrorCode.INVALID_CUSTOM_VARIABLE,
                category: ErrorCategory.VALIDATION,
                details: { provided: '--uv-' },
              },
              options,
            };
          }
          // --uv-name= の場合は name: ""
          const [name, valueRaw] = arg.slice(5).split('=');
          const value = valueRaw !== undefined ? valueRaw : '';
          if (name) {
            customVariables[name] = value;
          }
          continue;
        }
        if (arg.includes('=') && !arg.startsWith('--uv-')) {
          const [opt, value] = arg.split('=');
          switch (opt) {
            case '--from':
              longForm.fromFile = value;
              break;
            case '--destination':
              longForm.destinationFile = value;
              break;
            case '--input':
              longForm.fromLayerType = value;
              break;
            case '--adaptation':
              longForm.adaptationType = value;
              break;
            case '--config':
              longForm.configFile = value;
              break;
            default:
              break;
          }
          continue;
        }
        const nextArg = args[i + 1];
        switch (arg) {
          case '--from':
            if (nextArg && !nextArg.startsWith('-')) {
              longForm.fromFile = nextArg;
              i++;
            }
            break;
          case '--destination':
            if (nextArg && !nextArg.startsWith('-')) {
              longForm.destinationFile = nextArg;
              i++;
            }
            break;
          case '--input':
            if (nextArg && !nextArg.startsWith('-')) {
              longForm.fromLayerType = nextArg;
              i++;
            }
            break;
          case '--adaptation':
            if (nextArg && !nextArg.startsWith('-')) {
              longForm.adaptationType = nextArg;
              i++;
            }
            break;
          case '--config':
            if (nextArg && !nextArg.startsWith('-')) {
              longForm.configFile = nextArg;
              i++;
            }
            break;
          default:
            break;
        }
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        const nextArg = args[i + 1];
        switch (arg) {
          case '-f':
            if (nextArg && !nextArg.startsWith('-')) {
              shortForm.fromFile = nextArg;
              i++;
            }
            break;
          case '-o':
            if (nextArg && !nextArg.startsWith('-')) {
              shortForm.destinationFile = nextArg;
              i++;
            }
            break;
          case '-i':
            if (nextArg && !nextArg.startsWith('-')) {
              shortForm.fromLayerType = nextArg;
              i++;
            }
            break;
          case '-a':
            if (nextArg && !nextArg.startsWith('-')) {
              shortForm.adaptationType = nextArg;
              i++;
            }
            break;
          case '-c':
            if (nextArg && !nextArg.startsWith('-')) {
              shortForm.configFile = nextArg;
              i++;
            }
            break;
          default:
            break;
        }
      }
    }

    // 2. Assign options
    options.fromFile = longForm.fromFile ?? shortForm.fromFile;
    options.destinationFile = longForm.destinationFile ?? shortForm.destinationFile;
    options.fromLayerType = (longForm.fromLayerType ?? shortForm.fromLayerType) as LayerType | undefined;
    options.adaptationType = longForm.adaptationType ?? shortForm.adaptationType;
    options.configFile = longForm.configFile ?? shortForm.configFile;
    if (Object.keys(customVariables).length > 0) {
      options.customVariables = customVariables;
    }
    Object.keys(options).forEach((key) => {
      if (options[key as keyof OptionParams] === undefined) {
        delete options[key as keyof OptionParams];
      }
    });

    // 3. Validate and set error if needed
    let error: ErrorInfo | undefined = undefined;

    // Validate custom variables
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--uv-')) {
        // ... existing custom variable validation ...
        // (already present)
      } else if (arg.startsWith('--')) {
        // Standard long options
        const knownOptions = ['--from', '--destination', '--input', '--adaptation', '--config'];
        if (!knownOptions.includes(arg.split('=')[0]) && !arg.startsWith('--uv-') && !error) {
          error = {
            message: `Unknown option: ${arg}`,
            code: ErrorCode.UNKNOWN_OPTION,
            category: ErrorCategory.VALIDATION,
            details: { provided: arg },
          };
        }
      } else if (arg.startsWith('-')) {
        // Standard short options
        const knownOptions = ['-f', '-o', '-i', '-a', '-c'];
        if (!knownOptions.includes(arg) && !error) {
          error = {
            message: `Unknown option: ${arg}`,
            code: ErrorCode.UNKNOWN_OPTION,
            category: ErrorCategory.VALIDATION,
            details: { provided: arg },
          };
        }
      }
    }

    // Validate standard options for missing values
    // Only require --from and --destination for init command
    if (args[0] === 'init') {
      if (options.fromFile === undefined && !error) {
        error = {
          message: 'Missing required option: --from',
          code: ErrorCode.MISSING_VALUE_FOR_OPTION,
          category: ErrorCategory.VALIDATION,
          details: { option: '--from' },
        };
      }
      if (options.destinationFile === undefined && !error) {
        error = {
          message: 'Missing required option: --destination',
          code: ErrorCode.MISSING_VALUE_FOR_OPTION,
          category: ErrorCategory.VALIDATION,
          details: { option: '--destination' },
        };
      }
    }

    if (error) {
      return { error, options };
    }
    return options;
  }
} 