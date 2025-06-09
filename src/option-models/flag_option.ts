import { OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { validateOptionName } from './format_utils.ts';
import { BaseOption } from './base_option.ts';

export class FlagOption extends BaseOption {
  readonly type = OptionType.FLAG;
  readonly isRequired = false;

  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string,
    rawInput: string = '',
    longname?: string,
    shortname?: string,
  ) {
    // Initialize base option with long and short names
    super(rawInput || name, longname || name, shortname);
    
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

  /**
   * Get the value for flag options (always true when present)
   */
  getValue(): boolean {
    return true;
  }

  validate(): ValidationResult {
    return {
      isValid: true,
      validatedParams: [],
    };
  }
}
