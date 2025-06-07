import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';
import { ParserConfig, DEFAULT_CONFIG } from '../types/parser_config.ts';

/**
 * 2パラメータバリデータ
 * パラメータの数が2個であることを検証する
 */
export class TwoParamsValidator extends BaseValidator {
  /**
   * パラメータを検証する
   * @param params - 検証するパラメータ
   * @param config - バリデーション設定
   */
  override validate(params: string[], config?: ParserConfig): ValidationResult {
    if (params.length !== 2) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly two parameters',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation'
      };
    }

    const demonstrativePattern = config?.demonstrativeType?.pattern || DEFAULT_CONFIG.demonstrativeType?.pattern || "^(to|summary|defect)$";
    const layerPattern = config?.layerType?.pattern || DEFAULT_CONFIG.layerType?.pattern || "^(project|issue|task)$";
    const demonstrativeValid = new RegExp(demonstrativePattern).test(params[0]);
    const layerValid = new RegExp(layerPattern).test(params[1]);

    if (!demonstrativeValid || !layerValid) {
      return {
        isValid: false,
        validatedParams: params,
        demonstrativeType: params[0],
        layerType: params[1],
        errorMessage: !demonstrativeValid 
          ? (config?.demonstrativeType?.errorMessage || DEFAULT_CONFIG.demonstrativeType?.errorMessage || 'Invalid demonstrative type')
          : (config?.layerType?.errorMessage || DEFAULT_CONFIG.layerType?.errorMessage || 'Invalid layer type'),
        errorCode: !demonstrativeValid ? 'INVALID_DEMONSTRATIVE_TYPE' : 'INVALID_LAYER_TYPE',
        errorCategory: 'validation'
      };
    }

    return {
      isValid: true,
      validatedParams: params,
      demonstrativeType: params[0],
      layerType: params[1]
    };
  }
}
