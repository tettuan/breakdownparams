import { Option, OptionType, ValidationResult } from '../types/option.ts';

export class ValueOption implements Option {
  readonly type = OptionType.VALUE;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly isRequired: boolean,
    readonly description: string,
    private validator: (value: string) => ValidationResult,
  ) {}

  validate(_value: string | undefined): ValidationResult {
    if (this.isRequired && _value === undefined) {
      return { isValid: false, errors: [`${this.name} is required`] };
    }
    if (_value !== undefined) {
      return this.validator(_value);
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
    readonly description: string,
  ) {}

  validate(_value: string | undefined): ValidationResult {
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): boolean {
    return value === 'true';
  }
}

export class CustomVariableOption implements Option {
  readonly type = OptionType.CUSTOM_VARIABLE;
  readonly isRequired = false;
  readonly aliases: string[] = [];

  constructor(
    readonly name: string,
    readonly description: string,
    private pattern: RegExp,
  ) {}

  validate(_value: string | undefined): ValidationResult {
    if (!this.pattern.test(this.name)) {
      return {
        isValid: false,
        errors: [`Invalid custom variable name: ${this.name}`],
      };
    }
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): string | undefined {
    return value;
  }
}
