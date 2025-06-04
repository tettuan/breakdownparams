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
    console.log('[DEBUG] validate: start', args);

    if (args.length !== 2) {
      console.log('[DEBUG] validate: args length is not 2', { length: args.length, args });
      return this.createErrorResult(
        'Exactly two parameters expected',
        'VALIDATION_ERROR',
        'two_params',
      );
    }

    const [demonstrativeType, layerType] = args;
    console.log('[DEBUG] validate: extracted params', { demonstrativeType, layerType });

    if (!this.isValidDemonstrativeType(demonstrativeType)) {
      console.log('[DEBUG] validate: invalid demonstrative type', { demonstrativeType });
      return this.createErrorResult(
        'Invalid demonstrative type',
        'VALIDATION_ERROR',
        'demonstrative_type',
      );
    }

    if (!this.isValidLayerType(layerType)) {
      console.log('[DEBUG] validate: invalid layer type', { layerType });
      return this.createErrorResult(
        'Invalid layer type',
        'VALIDATION_ERROR',
        'layer_type',
      );
    }

    console.log('[DEBUG] validate: success', { demonstrativeType, layerType });
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
