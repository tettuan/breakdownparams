import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';

/**
 * 位置引数2つのバリデーター
 */
export class TwoParamValidator extends BaseValidator {
  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public override validate(args: string[]): ValidationResult {
    if (args.length !== 2) {
      return this.createErrorResult(
        'Exactly two parameters expected',
        'VALIDATION_ERROR',
        'two_params',
      );
    }

    const [demonstrativeType, layerType] = args;

    if (!this.isValidDemonstrativeType(demonstrativeType)) {
      return this.createErrorResult(
        'Invalid demonstrative type',
        'VALIDATION_ERROR',
        'demonstrative_type',
      );
    }

    if (!this.isValidLayerType(layerType)) {
      return this.createErrorResult(
        'Invalid layer type',
        'VALIDATION_ERROR',
        'layer_type',
      );
    }

    return {
      isValid: true,
      validatedParams: args,
      demonstrativeType,
      layerType,
    };
  }

  private isValidDemonstrativeType(value: string): boolean {
    const validTypes = ['to', 'summary', 'defect'];
    return validTypes.includes(value);
  }

  private isValidLayerType(value: string): boolean {
    const validTypes = ['project', 'issue', 'task'];
    return validTypes.includes(value);
  }
}
