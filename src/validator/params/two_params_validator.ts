import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../../types/validation_result.ts';
import { DEFAULT_TWO_PARAMS_CONFIG, TwoParamsConfig } from '../../types/params_config.ts';

/**
 * 2パラメータバリデータ
 * パラメータの数が2個であることを検証する
 * DemonstrativeTypeとLayerTypeのバリデーションを行う
 *
 * 実装の詳細:
 * 1. パラメータの数が2個であることを確認
 * 2. 1つ目のパラメータが DemonstrativeType (to|summary|defect) に一致することを確認
 * 3. 2つ目のパラメータが LayerType (project|issue|task) に一致することを確認
 * 4. バリデーション結果に demonstrativeType と layerType の値を含める
 *
 * 設定:
 * - config で DemonstrativeType と LayerType のパターンとエラーメッセージをカスタマイズ可能
 * - 設定がない場合は DEFAULT_TWO_PARAMS_CONFIG を使用
 * - デフォルトのパターン: "^(to|summary|defect)$" と "^(project|issue|task)$"
 */
export class TwoParamsValidator extends BaseValidator {
  private readonly config: TwoParamsConfig;

  constructor(config?: TwoParamsConfig) {
    super();
    this.config = config || DEFAULT_TWO_PARAMS_CONFIG;
  }

  /**
   * パラメータを検証する
   * @param params - 検証するパラメータ
   *
   * 検証の流れ:
   * 1. パラメータの数が2個でない場合はエラー
   * 2. 1つ目のパラメータが DemonstrativeType のパターンに一致するか確認
   * 3. 2つ目のパラメータが LayerType のパターンに一致するか確認
   * 4. どちらかが一致しない場合は、該当するエラーメッセージを返す
   * 5. 両方一致する場合は、検証済みパラメータと型情報を返す
   */
  override validate(params: string[]): ValidationResult {
    // パラメータの数が2個でない場合はエラー
    if (params.length !== 2) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly two parameters',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation',
      };
    }

    // DemonstrativeType と LayerType のパターンを取得
    // 優先順位: 1. config の設定 2. デフォルト設定 3. ハードコードされたデフォルト値
    const demonstrativePattern = this.config.demonstrativeType?.pattern ||
      DEFAULT_TWO_PARAMS_CONFIG.demonstrativeType?.pattern || '^(to|summary|defect)$';
    const layerPattern = this.config.layerType?.pattern ||
      DEFAULT_TWO_PARAMS_CONFIG.layerType?.pattern || '^(project|issue|task)$';

    // パターンマッチングで検証
    const demonstrativeValid = new RegExp(demonstrativePattern).test(params[0]);
    const layerValid = new RegExp(layerPattern).test(params[1]);

    // どちらかが一致しない場合はエラー
    if (!demonstrativeValid || !layerValid) {
      return {
        isValid: false,
        validatedParams: params,
        demonstrativeType: params[0],
        layerType: params[1],
        errorMessage: !demonstrativeValid
          ? (this.config.demonstrativeType?.errorMessage ||
            DEFAULT_TWO_PARAMS_CONFIG.demonstrativeType?.errorMessage ||
            `Invalid demonstrative type: ${params[0]}`)
          : (this.config.layerType?.errorMessage ||
            DEFAULT_TWO_PARAMS_CONFIG.layerType?.errorMessage ||
            `Invalid layer type: ${params[1]}`),
        errorCode: !demonstrativeValid ? 'INVALID_DEMONSTRATIVE_TYPE' : 'INVALID_LAYER_TYPE',
        errorCategory: 'validation',
      };
    }

    // 検証成功時は、検証済みパラメータと型情報を返す
    return {
      isValid: true,
      validatedParams: params,
      demonstrativeType: params[0],
      layerType: params[1],
    };
  }
}
