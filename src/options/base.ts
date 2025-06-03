import { Option, OptionType, OptionValue, ValidationResult } from "../types/option.ts";

export class ValueOption implements Option {
  readonly type = OptionType.VALUE;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly isRequired: boolean,
    readonly description: string,
    private validator: (value: string) => ValidationResult
  ) {}

  validate(value: string | undefined): ValidationResult {
    if (this.isRequired && value === undefined) {
      return { isValid: false, errors: [`${this.name} is required`] };
    }
    if (value !== undefined) {
      return this.validator(value);
    }
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): string | undefined {
    return value;
  }
}

export class FlagOption implements Option {
  readonly type = OptionType.FLAG;
  readonly isRequired = false;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string
  ) {}

  validate(value: string | undefined): ValidationResult {
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): boolean {
    return value !== undefined;
  }
}

export class CustomVariableOption implements Option {
  readonly type = OptionType.CUSTOM_VARIABLE;
  readonly isRequired = false;
  readonly aliases: string[] = [];

  constructor(
    readonly name: string,
    readonly description: string,
    private pattern: RegExp
  ) {}

  validate(value: string | undefined): ValidationResult {
    if (!this.pattern.test(this.name)) {
      return { 
        isValid: false, 
        errors: [`Invalid custom variable name: ${this.name}`] 
      };
    }
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): string | undefined {
    return value;
  }
} 