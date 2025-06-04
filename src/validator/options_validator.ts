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
    return key.replace(/^--?/, '').toLowerCase();
  }

  /**
   * Validates command-line arguments
   * @param args Command-line arguments
   * @returns Validation result
   */
  public override validate(args: string[]): ValidationResult {
    console.debug('[DEBUG] validate: start', args);
    const errors: string[] = [];
    const options: Record<string, string> = {};
    const seenKeys = new Set<string>();

    // Extract options and check for duplicates
    for (const arg of args) {
      // フラグオプションの処理（プレフィックスなし）
      if (this.isFlagOption(arg)) {
        if (seenKeys.has(arg)) {
          errors.push(`Duplicate option: ${arg}`);
        }
        seenKeys.add(arg);
        options[arg] = ''; // 元の形式を保持
        continue;
      }

      // 通常のオプション処理（プレフィックス付き）
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        const optionKey = this.normalizeKey(key);

        if (seenKeys.has(optionKey)) {
          errors.push(`Duplicate option: ${arg}`);
        }
        seenKeys.add(optionKey);
        options[arg] = value || ''; // 元の形式（プレフィックス付き）を保持
      }
    }
    console.debug('[DEBUG] extractOptions:', options);

    // Check option format (フラグオプションを除く)
    for (const arg of args) {
      if (
        arg.startsWith('-') && !this.isValidOption(arg) &&
        !this.isFlagOption(this.normalizeKey(arg.slice(2)))
      ) {
        console.debug('[DEBUG] invalid option format:', arg);
        errors.push(`Invalid option format: ${arg}`);
      }
    }
    console.debug('[DEBUG] after format check, errors:', errors);

    // Check for empty values (フラグオプションを除く)
    for (const [key, value] of Object.entries(options)) {
      const normalizedKey = this.normalizeKey(key.replace(/^--/, ''));
      if (
        this.optionRule.validation.emptyValue === 'error' && value === '' &&
        !this.isFlagOption(normalizedKey)
      ) {
        console.debug('[DEBUG] empty value not allowed:', normalizedKey);
        errors.push(`Empty value not allowed for option: ${normalizedKey}`);
      }
    }
    console.debug('[DEBUG] after empty value check, errors:', errors);

    // Check for unknown options (フラグオプションを除く)
    for (const key of Object.keys(options)) {
      const normalizedKey = this.normalizeKey(key.replace(/^--/, ''));
      if (
        !this.isValidOption(key) && !this.isFlagOption(normalizedKey) &&
        !this.isCustomVariable(normalizedKey)
      ) {
        console.debug('[DEBUG] unknown option:', normalizedKey);
        errors.push(`Unknown option: ${normalizedKey}`);
      }
    }
    console.debug('[DEBUG] after unknown option check, errors:', errors);

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
    const optionPattern = new RegExp(
      this.optionRule.format.replace('key', '(.+?)').replace('value', '(.+?)'),
    );
    if (!optionPattern.test(key)) {
      return false;
    }

    // If we get here, the option is not in any of our whitelists
    return false;
  }

  /**
   * Checks if an option is a flag option (--help, --version)
   * @param option Option string
   * @returns Whether the option is a flag option
   */
  private isFlagOption(option: string): boolean {
    const normalizedOption = this.normalizeKey(option);
    return Object.keys(this.optionRule.flagOptions).includes(normalizedOption);
  }

  /**
   * Checks if an option is a custom variable
   * @param key Option key
   * @returns Whether the option is a custom variable
   */
  private isCustomVariable(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    return this.optionRule.validation.customVariables.includes(normalizedKey);
  }
}
