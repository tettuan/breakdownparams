import {
  DEFAULT_OPTION_COMBINATION_RULES,
  OptionCombinationRule,
} from './option_combination_rule.ts';

/**
 * Option組み合わせ検証の結果を表すインターフェース
 * 検証結果の詳細情報（成功/失敗、エラーメッセージ、エラーコード、カテゴリ）を含む
 */
export interface OptionCombinationResult {
  /**
   * 検証が成功したかどうかを示すフラグ
   * true: 検証成功、false: 検証失敗
   */
  isValid: boolean;

  /**
   * 検証失敗時のエラーメッセージ
   * 検証成功時は未定義
   */
  errorMessage?: string;

  /**
   * 検証失敗時のエラーコード
   * 検証成功時は未定義
   */
  errorCode?: string;

  /**
   * 検証失敗時のエラーカテゴリ
   * 検証成功時は未定義
   */
  errorCategory?: string;
}

/**
 * コマンドラインオプションの組み合わせを検証するクラス
 *
 * このクラスは以下の検証を行います：
 * 1. 許可されていないオプションが指定されていないか
 * 2. 必須オプションがすべて指定されているか
 * 3. オプション間の依存関係（組み合わせルール）が満たされているか
 */
export class OptionCombinationValidator {
  private readonly customVariablePattern = /^uv-[a-zA-Z][a-zA-Z0-9_-]*$/;

  /**
   * @param rule - オプションの組み合わせルールを定義するオブジェクト
   */
  constructor(private rule: OptionCombinationRule) {}

  /**
   * 指定されたオプションの組み合わせがルールに合致するか検証する
   *
   * 検証の流れ：
   * 1. 許可されていないオプションのチェック
   * 2. 必須オプションの存在チェック
   * 3. オプション間の依存関係チェック
   *
   * @param options - 検証対象のオプション（キーと値のペア）
   * @returns 検証結果（成功/失敗とエラー情報）
   */
  validate(options: Record<string, unknown>): OptionCombinationResult {
    // 許可されていないoptionが含まれていないか
    for (const key of Object.keys(options)) {
      // カスタム変数（uv-*）は特別扱い - TwoParamsモードでのみ許可
      if (key.startsWith('uv-')) {
        // カスタム変数の形式チェック
        if (!this.isValidCustomVariableName(key)) {
          return {
            isValid: false,
            errorMessage: `Invalid custom variable format: ${key}`,
            errorCode: 'INVALID_CUSTOM_VARIABLE',
            errorCategory: 'validation',
          };
        }
        // カスタム変数はallowedOptionsのチェックをスキップ
        continue;
      }

      if (!this.rule.allowedOptions.includes(key)) {
        return {
          isValid: false,
          errorMessage: `Option '${key}' is not allowed`,
          errorCode: 'INVALID_OPTION',
          errorCategory: 'validation',
        };
      }
    }

    // 必須optionがすべて含まれているか
    if (this.rule.requiredOptions) {
      for (const req of this.rule.requiredOptions) {
        if (!(req in options)) {
          return {
            isValid: false,
            errorMessage: `Required option '${req}' is missing`,
            errorCode: 'MISSING_REQUIRED_OPTION',
            errorCategory: 'validation',
          };
        }
      }
    }

    // 組み合わせルールの検証
    if (this.rule.combinationRules) {
      for (const [key, required] of Object.entries(this.rule.combinationRules)) {
        if (key in options) {
          for (const req of required) {
            if (!(req in options)) {
              return {
                isValid: false,
                errorMessage: `Option '${key}' requires '${req}' to be specified`,
                errorCode: 'INVALID_OPTION_COMBINATION',
                errorCategory: 'validation',
              };
            }
          }
        }
      }
    }

    return { isValid: true };
  }

  /**
   * カスタム変数名の形式をチェックする
   * @param name - チェックする変数名
   * @returns 有効な形式の場合はtrue
   */
  private isValidCustomVariableName(name: string): boolean {
    return this.customVariablePattern.test(name);
  }

  /**
   * コマンドライン引数からオプションを抽出し、組み合わせを検証する静的メソッド
   *
   * 処理の流れ：
   * 1. コマンドライン引数からオプションを抽出（--で始まる引数を処理）
   * 2. パラメータタイプに応じたルールを取得し、バリデータを初期化
   * 3. 抽出したオプションに対して、選択されたルールに基づいて検証を実行
   * 4. 検証結果（成功/失敗とエラー情報）を返却
   *
   * @param args - コマンドライン引数の配列
   * @param type - パラメータタイプ（'zero' | 'one' | 'two'）
   * @returns 検証結果（成功/失敗とエラー情報）
   */
  static validate(args: string[], type: 'zero' | 'one' | 'two'): OptionCombinationResult {
    const options: Record<string, unknown> = {};
    for (const arg of args) {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        options[key] = value || true;
      }
    }

    // パラメータタイプに応じたルールを取得し、バリデータを初期化
    // type: 'zero' | 'one' | 'two' に基づいて、DEFAULT_OPTION_COMBINATION_RULESから
    // 適切なルールセットを選択
    const validator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES[type]);

    // 抽出したオプションに対して、選択されたルールに基づいて検証を実行
    // 検証結果（成功/失敗とエラー情報）を返却
    return validator.validate(options);
  }
}
