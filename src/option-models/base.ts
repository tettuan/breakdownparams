import { Option, OptionType } from './types.ts';
import { ValidationResult } from '../result/types.ts';

/**
 * 値を持つオプション
 */
export class ValueOption implements Option {
  public readonly type = OptionType.VALUE;
  public readonly name: string;
  public readonly aliases: string[];
  public readonly isRequired: boolean;
  public readonly description: string;
  private readonly validator: (value: string) => ValidationResult;

  constructor(
    name: string,
    aliases: string[],
    isRequired: boolean,
    description: string,
    validator: (value: string) => ValidationResult,
  ) {
    this.name = name;
    this.aliases = aliases;
    this.isRequired = isRequired;
    this.description = description;
    this.validator = validator;
  }

  public validate(value: string): ValidationResult {
    if (this.isRequired && !value) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `${this.name} is required`,
        errorCode: 'REQUIRED_OPTION',
        errorCategory: 'validation',
        errors: [`${this.name} is required`],
      };
    }

    if (!value) {
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    return this.validator(value);
  }

  public parse(value: string): unknown {
    return value;
  }
}

/**
 * フラグオプション
 */
export class FlagOption implements Option {
  public readonly type = OptionType.FLAG;
  public readonly isRequired = false;

  constructor(
    public readonly name: string,
    public readonly aliases: string[],
    public readonly description: string,
  ) {}

  public validate(_value: string): ValidationResult {
    return {
      isValid: true,
      validatedParams: [],
      errors: [],
    };
  }

  public parse(_value: string): boolean {
    return true;
  }
}

/**
 * カスタム変数オプション
 */
export class CustomVariableOption implements Option {
  public readonly type = OptionType.CUSTOM_VARIABLE;
  public readonly isRequired = false;

  constructor(
    public readonly name: string,
    public readonly aliases: string[],
    public readonly description: string,
    private readonly pattern: RegExp,
  ) {}

  public validate(value: string): ValidationResult {
    if (!this.pattern.test(value)) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `Invalid custom variable name: ${value}`,
        errorCode: 'INVALID_CUSTOM_VARIABLE',
        errorCategory: 'validation',
        errors: [`Invalid custom variable name: ${value}`],
      };
    }

    return {
      isValid: true,
      validatedParams: [value],
      errors: [],
    };
  }

  public parse(value: string): string {
    return value;
  }
}
