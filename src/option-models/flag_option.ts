import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { validateEmptyValue, validateOptionFormat } from './format_utils.ts';

export class FlagOption implements Option {
  readonly type = OptionType.FLAG;
  readonly isRequired = false;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string,
  ) {}

  validate(value: unknown): ValidationResult {
    // 値が未定義または空文字列の場合は有効（フラグが設定されていない）
    if (value === undefined || value === '') {
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    const strValue = value as string;

    // オプションの書式をチェック
    const formatValidation = validateOptionFormat(this.name);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: formatValidation.error,
      };
    }

    // フラグオプションは値を持たないことをチェック
    if (!validateEmptyValue(strValue)) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Invalid option format: Flag options should not have values',
      };
    }

    return {
      isValid: true,
      validatedParams: [],
    };
  }

  parse(value: unknown): boolean {
    if (value === undefined || value === '') {
      return false;
    }
    const strValue = value as string;
    return strValue === this.name || this.aliases.includes(strValue);
  }
}
