import { OptionParams, ErrorInfo, ErrorCode, ErrorCategory, LayerType } from '../../params/definitions/types.ts';
import { ValidatorFactory } from '../../../validators/validator_factory.ts';
import { FLAG_OPTIONS } from '../definitions/option_config.ts';
import { OptionProcessor } from './option_processor.ts';

/**
 * オプションの設定を定義するインターフェース
 */
interface OptionConfig {
  longForm: string;
  shortForm: string;
  key: keyof OptionParams;
  type: 'string' | 'layerType';
}

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
    const _customVariableValidator = this.validatorFactory.createCustomVariableValidator();

    // Track long and short form values separately
    const longForm: Record<string, string | undefined> = {};
    const shortForm: Record<string, string | undefined> = {};

    // 最大値の制限
    const _MAX_VALUE_LENGTH = 1000;
    const _MAX_CUSTOM_VARIABLES = 100;

    // 1. Parse all arguments and accumulate custom variables and options
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        if (FLAG_OPTIONS.has(arg)) {
          continue;
        }
        if (arg.startsWith('--uv-')) {
          const result = OptionProcessor.processCustomVariable(arg);
          if ('name' in result) {
            customVariables[result.name] = result.value;
          } else {
            return { error: result, options };
          }
          continue;
        }
        if (arg.includes('=')) {
          const [opt, value] = arg.split('=');
          const result = OptionProcessor.processLongOption(opt, value);
          if ('key' in result) {
            longForm[result.key] = result.value;
          } else {
            return { error: result, options };
          }
        } else {
          return {
            error: {
              message: `Option value must be specified with '=': ${arg}`,
              code: ErrorCode.MISSING_VALUE_FOR_OPTION,
              category: ErrorCategory.VALIDATION,
              details: { option: arg },
            },
            options,
          };
        }
      } else if (arg.startsWith('-')) {
        if (FLAG_OPTIONS.has(arg)) {
          continue;
        }
        if (arg.includes('=')) {
          const [opt, value] = arg.split('=');
          const result = OptionProcessor.processShortOption(opt, value);
          if ('key' in result) {
            shortForm[result.key] = result.value;
          } else {
            return { error: result, options };
          }
        } else {
          return {
            error: {
              message: `Option value must be specified with '=': ${arg}`,
              code: ErrorCode.MISSING_VALUE_FOR_OPTION,
              category: ErrorCategory.VALIDATION,
              details: { option: arg },
            },
            options,
          };
        }
      }
    }

    // 2. Assign options
    for (const [key, value] of Object.entries(longForm)) {
      const optionKey = key as keyof OptionParams;
      if (value !== undefined) {
        if (optionKey === 'fromLayerType') {
          options.fromLayerType = value as LayerType;
        } else if (optionKey === 'fromFile') {
          options.fromFile = value;
        } else if (optionKey === 'destinationFile') {
          options.destinationFile = value;
        } else if (optionKey === 'adaptationType') {
          options.adaptationType = value;
        } else if (optionKey === 'configFile') {
          options.configFile = value;
        }
      }
    }
    for (const [key, value] of Object.entries(shortForm)) {
      const optionKey = key as keyof OptionParams;
      if (value !== undefined && options[optionKey] === undefined) {
        if (optionKey === 'fromLayerType') {
          options.fromLayerType = value as LayerType;
        } else if (optionKey === 'fromFile') {
          options.fromFile = value;
        } else if (optionKey === 'destinationFile') {
          options.destinationFile = value;
        } else if (optionKey === 'adaptationType') {
          options.adaptationType = value;
        } else if (optionKey === 'configFile') {
          options.configFile = value;
        }
      }
    }

    if (Object.keys(customVariables).length > 0) {
      options.customVariables = customVariables;
    }

    // 3. Validate and set error if needed
    let error: ErrorInfo | undefined = undefined;

    // Validate custom variables
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--uv-')) {
        // ... existing custom variable validation ...
        // (already present)
      } else if (!OptionProcessor.validateKnownOption(arg) && !error) {
        error = {
          message: `Unknown option: ${arg}`,
          code: ErrorCode.UNKNOWN_OPTION,
          category: ErrorCategory.VALIDATION,
          details: { provided: arg },
        };
      }
    }

    if (error) {
      return { error, options };
    }
    return options;
  }
} 