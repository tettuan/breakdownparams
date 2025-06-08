import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { validateOptionName } from './format_utils.ts';

export class FlagOption implements Option {
  readonly type = OptionType.FLAG;
  readonly isRequired = false;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string,
  ) {
    // Validate option name (remove -- prefix if present)
    const cleanName = name.startsWith('--') ? name.slice(2) : name;
    const nameValidation = validateOptionName(cleanName);
    if (!nameValidation.isValid) {
      throw new Error(`Invalid option name: ${nameValidation.error}`);
    }

    // Validate aliases
    for (const alias of aliases) {
      const cleanAlias = alias.startsWith('-') ? alias.slice(1) : alias;
      const aliasValidation = validateOptionName(cleanAlias);
      if (!aliasValidation.isValid) {
        throw new Error(`Invalid alias: ${aliasValidation.error}`);
      }
    }
  }

  validate(): ValidationResult {
    return {
      isValid: true,
      validatedParams: [],
    };
  }
}
