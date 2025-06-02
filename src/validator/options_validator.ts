import { BaseValidator } from "./base_validator.ts";
import { ValidationResult, OptionRule } from "../result/types.ts";

/**
 * オプションバリデーター
 */
export class OptionsValidator extends BaseValidator {
  protected override optionRule: OptionRule;

  constructor(optionRule: OptionRule) {
    super(optionRule);
    this.optionRule = optionRule;
  }

  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public override validate(args: string[]): ValidationResult {
    const options = this.extractOptions(args);
    const errors: string[] = [];

    // Check for empty values if not allowed
    if (!this.optionRule.validation.emptyValue) {
      for (const [key, value] of Object.entries(options)) {
        if (value === "") {
          errors.push(`Empty value not allowed for option: ${key}`);
        }
      }
    }

    // Check for unknown options
    if (this.optionRule.validation.unknownOption === "error") {
      for (const key of Object.keys(options)) {
        if (!this.isValidOption(key)) {
          errors.push(`Unknown option: ${key}`);
        }
      }
    }

    // Check for duplicate options
    if (this.optionRule.validation.duplicateOption === "error") {
      const seen = new Set<string>();
      for (const key of Object.keys(options)) {
        if (seen.has(key)) {
          errors.push(`Duplicate option: ${key}`);
        }
        seen.add(key);
      }
    }

    // Check required options
    for (const required of this.optionRule.validation.requiredOptions) {
      if (!(required in options)) {
        errors.push(`Required option missing: ${required}`);
      }
    }

    if (errors.length > 0) {
      return this.createErrorResult(
        errors.join(", "),
        "VALIDATION_ERROR",
        "options"
      );
    }

    return this.createSuccessResult(args);
  }

  private extractOptions(args: string[]): Record<string, string> {
    const options: Record<string, string> = {};
    const optionPattern = new RegExp(this.optionRule.format.replace("key", "(.+?)").replace("value", "(.+?)"));

    for (const arg of args) {
      const match = arg.match(optionPattern);
      if (match) {
        const [, key, value] = match;
        options[key] = value;
      }
    }

    return options;
  }

  private isValidOption(key: string): boolean {
    // Check special cases
    if (key in this.optionRule.specialCases) {
      return true;
    }

    // Check custom variables
    if (this.isCustomVariable(key)) {
      return true;
    }

    // Add more validation rules as needed
    return false;
  }

  /**
   * オプションの形式を検証する
   * @param option オプション
   * @returns 検証結果
   */
  private validateOptionFormat(option: string): boolean {
    const { format } = this.optionRule;
    if (format === '--key=value') {
      return /^--[a-zA-Z0-9-]+=.+$/.test(option);
    } else {
      return /^-[a-zA-Z]=.+$/.test(option);
    }
  }

  /**
   * オプションの値を検証する
   * @param option オプション
   * @returns 検証結果
   */
  private validateOptionValue(option: string): boolean {
    const [, value] = option.split('=');
    if (!value) {
      return this.optionRule.validation.emptyValue === "ignore";
    }

    const valueTypes = this.optionRule.validation.valueTypes;
    if (valueTypes.includes('string')) {
      return true;
    }
    if (valueTypes.includes('number') && !isNaN(Number(value))) {
      return true;
    }
    if (valueTypes.includes('boolean') && ['true', 'false'].includes(value)) {
      return true;
    }

    return false;
  }

  /**
   * 必須オプションを検証する
   * @param options オプション配列
   * @returns 検証結果
   */
  private validateRequiredOptions(options: string[]): boolean {
    const requiredOptions = this.optionRule.validation.requiredOptions;
    return requiredOptions.every(required => 
      options.some(option => option.startsWith(required))
    );
  }

  /**
   * オプションの依存関係を検証する
   * @param options オプション配列
   * @returns 検証結果
   */
  private validateOptionDependencies(options: string[]): boolean {
    const specialCases = this.optionRule.specialCases;
    for (const [option, type] of Object.entries(specialCases)) {
      if (options.some(opt => opt.startsWith(option))) {
        if (type === 'configFile' && !options.some(opt => opt.startsWith('--from='))) {
          return false;
        }
      }
    }
    return true;
  }

  private isCustomVariable(key: string): boolean {
    return this.optionRule.validation.customVariables.some(pattern => 
      key.startsWith(pattern.replace("*", ""))
    );
  }

  private validateEmptyValue(value: string): boolean {
    if (value === "") {
      return this.optionRule.validation.emptyValue === "ignore";
    }
    return true;
  }
} 