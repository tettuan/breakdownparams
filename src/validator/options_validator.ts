import { BaseValidator } from './base_validator.ts';
import { OptionRule, ValidationResult } from '../result/types.ts';

/**
 * Options Validator
 * Validates command-line options according to the specified rules.
 */
export class OptionsValidator extends BaseValidator {
  protected override optionRule: OptionRule;

  // 標準オプションのホワイトリスト
  private readonly standardOptions = new Set([
    'help',
    'version',
    'from',
    'destination',
    'input',
    'adaptation',
    'config',
  ]);

  constructor(optionRule: OptionRule) {
    super(optionRule);
    this.optionRule = optionRule;
  }

  /**
   * Normalizes an option key by removing prefixes and converting to lowercase
   * @param key Option key
   * @returns Normalized key
   */
  private normalizeKey(key: string): string {
    const normalized = key.replace(/^--?/, '').toLowerCase();
    return normalized;
  }

  /**
   * Validates command-line arguments
   * @param args Command-line arguments
   * @returns Validation result
   */
  public override validate(args: string[]): ValidationResult {
    const errors: string[] = [];
    const options: Record<string, string> = {};
    const seenKeys = new Set<string>();

    // Extract options and check for duplicates
    for (const arg of args) {
      // フラグオプションの処理（プレフィックスなし）
      if (this.isFlagOption(arg)) {
        // フラグオプションに値が指定されている場合はエラー
        if (arg.includes('=')) {
          const [key] = arg.split('=');
          errors.push(`Flag option ${key} should not have a value`);
          continue;
        }

        if (seenKeys.has(arg)) {
          errors.push(`Duplicate option: ${arg}`);
        }
        seenKeys.add(arg);
        const normalizedKey = this.normalizeKey(arg);
        options[normalizedKey] = 'true'; // 存在を表す値を設定
        continue;
      }

      // 通常のオプション処理（プレフィックス付き）
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        const optionKey = this.normalizeKey(key);

        // フラグオプションに値が指定されている場合はエラー
        if (this.isFlagOption(optionKey) && value !== undefined) {
          errors.push(`Flag option --${optionKey} should not have a value`);
          continue;
        }

        if (seenKeys.has(optionKey)) {
          errors.push(`Duplicate option: ${arg}`);
        }
        seenKeys.add(optionKey);
        options[optionKey] = value || ''; // 正規化されたキーを使用
      }
    }

    // Check option format (フラグオプションを除く)
    for (const arg of args) {
      if (
        arg.startsWith('-') && !this.isValidOption(arg) &&
        !this.isFlagOption(this.normalizeKey(arg.slice(2)))
      ) {
        errors.push(`Invalid option format: ${arg}`);
      }
    }

    // Check for empty values (フラグオプションを除く)
    for (const [key, value] of Object.entries(options)) {
      const normalizedKey = this.normalizeKey(key);
      if (
        this.optionRule.validation.emptyValue === 'error' && value === '' &&
        !this.isFlagOption(normalizedKey)
      ) {
        errors.push(`Empty value not allowed for option: ${normalizedKey}`);
      }
    }

    // Check for unknown options (フラグオプションを除く)
    for (const key of Object.keys(options)) {
      const normalizedKey = this.normalizeKey(key);
      if (
        !this.isValidOption(`--${key}`) && !this.isFlagOption(normalizedKey) &&
        !this.isCustomVariable(normalizedKey)
      ) {
        errors.push(`Unknown option: ${normalizedKey}`);
      }
    }

    const isValid = errors.length === 0;
    const errorMessage = errors.join(', ');
    const errorCategory = errorMessage.includes('Invalid option format')
      ? 'invalid_format'
      : errorMessage.includes('Duplicate option')
      ? 'duplicate_option'
      : 'validation';

    return {
      isValid,
      validatedParams: isValid ? args : [],
      error: errors.length > 0
        ? {
          message: errorMessage,
          code: 'VALIDATION_ERROR',
          category: errorCategory,
        }
        : undefined,
    };
  }

  /**
   * Checks if an option is valid according to the rules
   * @param key Option key
   * @returns Whether the option is valid
   */
  private isValidOption(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);

    // Check flag options
    if (this.isFlagOption(normalizedKey)) {
      return true;
    }

    // Check standard options
    if (this.standardOptions.has(normalizedKey)) {
      return true;
    }

    // Check custom variables (--uv-*)
    if (normalizedKey.startsWith('uv-')) {
      const customVarName = normalizedKey.split('=')[0];
      if (this.isCustomVariable(customVarName)) {
        return true;
      }
    }

    // Check format
    if (this.optionRule.format === '--key=value') {
      const isValid = /^--[a-zA-Z0-9-]+=[^=]+$/.test(key);
      return isValid;
    }

    return false;
  }

  /**
   * Checks if an option is a flag option (--help, --version)
   * @param option Option string
   * @returns Whether the option is a flag option
   */
  private isFlagOption(option: string): boolean {
    const normalizedOption = this.normalizeKey(option);
    const isFlag = Object.keys(this.optionRule.flagOptions).includes(normalizedOption);
    return isFlag;
  }

  /**
   * Checks if an option is a custom variable
   * @param key Option key
   * @returns Whether the option is a custom variable
   */
  private isCustomVariable(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    const isCustom = this.optionRule.validation.customVariables.includes(normalizedKey);
    return isCustom;
  }
}
