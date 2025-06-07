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
    console.debug('[DEBUG] OptionsValidator initialized with rule:', optionRule);
  }

  /**
   * Normalizes an option key by removing prefixes and converting to lowercase
   * @param key Option key
   * @returns Normalized key
   */
  private normalizeKey(key: string): string {
    const normalized = key.replace(/^--?/, '').toLowerCase();
    console.debug('[DEBUG] normalizeKey:', { original: key, normalized });
    return normalized;
  }

  /**
   * Validates command-line arguments
   * @param args Command-line arguments
   * @returns Validation result
   */
  public override validate(args: string[]): ValidationResult {
    console.debug('[DEBUG] validate: start', { args, optionRule: this.optionRule });
    const errors: string[] = [];
    const options: Record<string, string> = {};
    const seenKeys = new Set<string>();

    // Extract options and check for duplicates
    for (const arg of args) {
      console.debug('[DEBUG] processing arg:', arg);

      // フラグオプションの処理（プレフィックスなし）
      if (this.isFlagOption(arg)) {
        console.debug('[DEBUG] processing flag option:', {
          arg,
          normalizedKey: this.normalizeKey(arg),
          hasValue: arg.includes('='),
          value: arg.split('=')[1],
        });

        // フラグオプションに値が指定されている場合はエラー
        if (arg.includes('=')) {
          const [key] = arg.split('=');
          console.debug('[DEBUG] flag option with value detected:', { key });
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
        console.debug('[DEBUG] processing standard option:', arg);
        const [key, value] = arg.slice(2).split('=');
        const optionKey = this.normalizeKey(key);

        // フラグオプションに値が指定されている場合はエラー
        if (this.isFlagOption(optionKey) && value !== undefined) {
          console.debug('[DEBUG] flag option with value detected:', { key, value });
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
    console.debug('[DEBUG] extracted options:', { options, seenKeys });

    // Check option format (フラグオプションを除く)
    for (const arg of args) {
      if (
        arg.startsWith('-') && !this.isValidOption(arg) &&
        !this.isFlagOption(this.normalizeKey(arg.slice(2)))
      ) {
        console.debug('[DEBUG] invalid option format:', {
          arg,
          isValidOption: this.isValidOption(arg),
          isFlagOption: this.isFlagOption(this.normalizeKey(arg.slice(2))),
        });
        errors.push(`Invalid option format: ${arg}`);
      }
    }
    console.debug('[DEBUG] after format check:', { errors });

    // Check for empty values (フラグオプションを除く)
    for (const [key, value] of Object.entries(options)) {
      const normalizedKey = this.normalizeKey(key);
      if (
        this.optionRule.validation.emptyValue === 'error' && value === '' &&
        !this.isFlagOption(normalizedKey)
      ) {
        console.debug('[DEBUG] empty value check failed:', {
          key,
          normalizedKey,
          value,
          emptyValue: this.optionRule.validation.emptyValue,
          isFlagOption: this.isFlagOption(normalizedKey),
        });
        errors.push(`Empty value not allowed for option: ${normalizedKey}`);
      }
    }
    console.debug('[DEBUG] after empty value check:', { errors });

    // Check for unknown options (フラグオプションを除く)
    for (const key of Object.keys(options)) {
      const normalizedKey = this.normalizeKey(key);
      if (
        !this.isValidOption(`--${key}`) && !this.isFlagOption(normalizedKey) &&
        !this.isCustomVariable(normalizedKey)
      ) {
        console.debug('[DEBUG] unknown option check failed:', {
          key,
          normalizedKey,
          isValidOption: this.isValidOption(`--${key}`),
          isFlagOption: this.isFlagOption(normalizedKey),
          isCustomVariable: this.isCustomVariable(normalizedKey),
          standardOptions: Array.from(this.standardOptions),
          customVariables: this.optionRule.validation.customVariables,
        });
        errors.push(`Unknown option: ${normalizedKey}`);
      }
    }
    console.debug('[DEBUG] after unknown option check:', { errors });

    const isValid = errors.length === 0;
    const errorMessage = errors.join(', ');
    const errorCategory = errorMessage.includes('Invalid option format')
      ? 'invalid_format'
      : errorMessage.includes('Duplicate option')
      ? 'duplicate_option'
      : 'validation';

    console.debug('[DEBUG] validation result:', {
      isValid,
      errorMessage,
      errorCategory,
      validatedParams: isValid ? args : [],
      errors,
    });

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
    console.debug('[DEBUG] isValidOption check:', {
      key,
      normalizedKey,
      standardOptions: Array.from(this.standardOptions),
      customVariables: this.optionRule.validation.customVariables,
    });

    // Check flag options
    if (this.isFlagOption(normalizedKey)) {
      console.debug('[DEBUG] is flag option:', normalizedKey);
      return true;
    }

    // Check standard options
    if (this.standardOptions.has(normalizedKey)) {
      console.debug('[DEBUG] is standard option:', normalizedKey);
      return true;
    }

    // Check custom variables (--uv-*)
    if (normalizedKey.startsWith('uv-')) {
      const customVarName = normalizedKey.split('=')[0];
      if (this.isCustomVariable(customVarName)) {
        console.debug('[DEBUG] is custom variable:', { normalizedKey, customVarName });
        return true;
      }
    }

    // Check format
    if (this.optionRule.format === '--key=value') {
      const isValid = /^--[a-zA-Z0-9-]+=[^=]+$/.test(key);
      console.debug('[DEBUG] format check:', { key, isValid });
      return isValid;
    }

    console.debug('[DEBUG] option not in any whitelist:', normalizedKey);
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
    console.debug('[DEBUG] isFlagOption check:', {
      option,
      normalizedOption,
      isFlag,
      flagOptions: this.optionRule.flagOptions,
    });
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
    console.debug('[DEBUG] isCustomVariable check:', {
      key,
      normalizedKey,
      isCustom,
      customVariables: this.optionRule.validation.customVariables,
    });
    return isCustom;
  }
}
