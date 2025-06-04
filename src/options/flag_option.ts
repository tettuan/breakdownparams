import { Option, OptionType } from './types.ts';
import { ValidationResult } from '../result/types.ts';

export class FlagOption implements Option {
  readonly type = OptionType.FLAG;
  readonly isRequired = false;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string,
  ) {}

  validate(_value: string | undefined): ValidationResult {
    return {
      isValid: true,
      validatedParams: [],
    };
  }

  parse(value: string | undefined): boolean {
    return value !== undefined;
  }
}
