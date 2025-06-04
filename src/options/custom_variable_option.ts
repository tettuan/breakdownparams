import { Option, OptionType } from './types.ts';
import { ValidationResult } from '../result/types.ts';

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
        validatedParams: [],
        errorMessage: `Invalid custom variable name: ${this.name}`,
      };
    }
    return {
      isValid: true,
      validatedParams: [],
    };
  }

  parse(value: string | undefined): string | undefined {
    return value;
  }
}
