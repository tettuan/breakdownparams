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

  validate(value: string | undefined): ValidationResult {
    if (value !== undefined) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Invalid option format: Flag options should not have values',
      };
    }
    return {
      isValid: true,
      validatedParams: [],
    };
  }

  parse(_value: string | undefined): undefined {
    return undefined;
  }
}
