/**
 * Optionの組み合わせ検証用ルール
 */
export interface OptionCombinationRule {
  /**
   * 許可されるオプションのリスト
   */
  allowedOptions: string[];

  /**
   * 必須のオプションのリスト
   */
  requiredOptions?: string[];

  /**
   * オプションの組み合わせルール
   * 例: { from: ['destination'] } は from が指定された場合、destination も必須
   */
  combinationRules?: Record<string, string[]>;
}

/**
 * パラメータタイプごとのOption組み合わせルール
 */
export interface OptionCombinationRules {
  zero: OptionCombinationRule;
  one: OptionCombinationRule;
  two: OptionCombinationRule;
}

/**
 * デフォルトのOption組み合わせルール
 */
export const DEFAULT_OPTION_COMBINATION_RULES: OptionCombinationRules = {
  zero: {
    allowedOptions: ['help', 'version'],
  },
  one: {
    allowedOptions: ['config'],
  },
  two: {
    allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input'],
  },
};
