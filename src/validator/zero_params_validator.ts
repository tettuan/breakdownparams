import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';
import { OptionsValidator } from './options_validator.ts';

/**
 * 位置引数なしのバリデーター
 */
export class ZeroParamsValidator extends BaseValidator {
  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public override validate(args: string[]): ValidationResult {
    // Check if there are any non-option arguments
    const hasNonOptions = args.some((arg) => !arg.startsWith('-'));
    if (hasNonOptions) {
      return this.createErrorResult(
        'Zero params validator only accepts options',
        'VALIDATION_ERROR',
        'invalid_params',
      );
    }

    // Validate options
    const optionsValidator = new OptionsValidator(this.optionRule);
    const optionsResult = optionsValidator.validate(args);
    if (!optionsResult.isValid) {
      return optionsResult;
    }

    return this.createSuccessResult(args);
  }
}
