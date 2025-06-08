/**
 * オプションのバリデーションルール
 */
export interface OptionRule {
  /**
   * オプションの基本形式
   * 現在は '--key=value' のみをサポート
   */
  format: '--key=value';

  /**
   * フラグオプションの定義
   * 値を持たないオプション（例：--help, --version）
   */
  flagOptions: {
    [key: string]: string;
  };

  /**
   * バリデーションルール
   */
  rules: {
    /**
     * カスタム変数の定義
     * 例：['--uv-config', '--uv-env']
     */
    customVariables: string[];

    /**
     * 必須オプションの定義
     * 例：['--input', '--output']
     */
    requiredOptions: string[];

    /**
     * 値の型定義
     * 例：['string', 'number']
     */
    valueTypes: ('string' | 'number' | 'boolean')[];
  };

  /**
   * エラーハンドリング設定
   */
  errorHandling: {
    /**
     * 空値の扱い
     * error: エラーとして扱う
     * warning: 警告として扱う
     * ignore: 無視する
     */
    emptyValue: 'error' | 'warning' | 'ignore';

    /**
     * 未知のオプションの扱い
     * error: エラーとして扱う
     * warning: 警告として扱う
     * ignore: 無視する
     */
    unknownOption: 'error' | 'warning' | 'ignore';

    /**
     * 重複オプションの扱い
     * error: エラーとして扱う
     * warning: 警告として扱う
     * ignore: 無視する
     */
    duplicateOption: 'error' | 'warning' | 'ignore';
  };
}

/**
 * デフォルトのオプションルール
 */
export const DEFAULT_OPTION_RULE: OptionRule = {
  format: '--key=value',
  flagOptions: {
    help: 'help',
    version: 'version',
  },
  rules: {
    customVariables: [],
    requiredOptions: [],
    valueTypes: ['string'],
  },
  errorHandling: {
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
  },
}; 