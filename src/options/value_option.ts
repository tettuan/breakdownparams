import { Option, OptionType } from './types.ts';
import { ValidationResult } from '../result/types.ts';

export class ValueOption implements Option {
  readonly type = OptionType.VALUE;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly isRequired: boolean,
    readonly description: string,
    private validator: (value: string) => ValidationResult,
  ) {}

  validate(value: string | undefined): ValidationResult {
    if (this.isRequired && value === undefined) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: `${this.name} is required`,
      };
    }
    if (value !== undefined) {
      return this.validator(value);
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
