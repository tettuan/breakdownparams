import {
  ErrorCategory,
  ErrorCode,
  ErrorInfo,
  LayerType,
  OptionParams,
} from '../../params/definitions/types.ts';
import { FLAG_OPTIONS, STANDARD_OPTIONS } from '../definitions/option_config.ts';

/**
 * オプション処理を担当するユーティリティクラス
 */
export class OptionProcessor {
  /**
   * 長形式オプションを処理する
   */
  static processLongOption(
    opt: string,
    value: string,
  ): { key: keyof OptionParams; value: string } | ErrorInfo {
    const optionConfig = STANDARD_OPTIONS.find((o) => o.longForm === opt);
    if (optionConfig) {
      return { key: optionConfig.key, value };
    }
    return {
      message: `Unknown option: ${opt}`,
      code: ErrorCode.UNKNOWN_OPTION,
      category: ErrorCategory.SYNTAX,
      details: { provided: opt },
    };
  }

  /**
   * 短形式オプションを処理する
   */
  static processShortOption(
    opt: string,
    value: string,
  ): { key: keyof OptionParams; value: string } | ErrorInfo {
    const optionConfig = STANDARD_OPTIONS.find((o) => o.shortForm === opt);
    if (optionConfig) {
      return { key: optionConfig.key, value };
    }
    return {
      message: `Unknown option: ${opt}`,
      code: ErrorCode.UNKNOWN_OPTION,
      category: ErrorCategory.SYNTAX,
      details: { provided: opt },
    };
  }

  /**
   * カスタム変数を処理する
   */
  static processCustomVariable(arg: string): { name: string; value: string } | ErrorInfo {
    if (arg === '--uv-') {
      return {
        message: 'Invalid custom variable name: --uv-',
        code: ErrorCode.INVALID_CUSTOM_VARIABLE,
        category: ErrorCategory.VALIDATION,
        details: { provided: '--uv-' },
      };
    }
    const [name, valueRaw] = arg.slice(5).split('=');
    const value = valueRaw !== undefined ? valueRaw : '';
    if (name) {
      return { name, value };
    }
    return {
      message: 'Invalid custom variable format',
      code: ErrorCode.INVALID_CUSTOM_VARIABLE,
      category: ErrorCategory.VALIDATION,
      details: { provided: arg },
    };
  }

  /**
   * オプション値を割り当てる
   */
  static assignOptionValue(
    options: OptionParams,
    key: keyof OptionParams,
    value: string,
    type: 'string' | 'layerType',
  ): void {
    if (key === 'fromLayerType' && type === 'layerType') {
      options.fromLayerType = value as LayerType;
    } else if (
      key === 'fromFile' || key === 'destinationFile' || key === 'adaptationType' ||
      key === 'configFile'
    ) {
      options[key] = value;
    } else if (key === 'customVariables') {
      // customVariablesはRecord<string, string>型なのでここではスキップ
    }
  }

  /**
   * 既知のオプションかどうかを検証する
   */
  static validateKnownOption(arg: string): boolean {
    if (arg.startsWith('--')) {
      return STANDARD_OPTIONS.some((o) => o.longForm === arg.split('=')[0]) ||
        arg.startsWith('--uv-') ||
        FLAG_OPTIONS.has(arg);
    } else if (arg.startsWith('-')) {
      return STANDARD_OPTIONS.some((o) => o.shortForm === arg.split('=')[0]) ||
        FLAG_OPTIONS.has(arg);
    }
    return false;
  }
}
