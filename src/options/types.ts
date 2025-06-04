import { ValidationResult } from '../result/types.ts';

export interface Option {
  readonly name: string;
  readonly aliases: string[];
  readonly type: OptionType;
  readonly isRequired: boolean;
  readonly description: string;

  validate(value: string | undefined): ValidationResult;
  parse(value: string | undefined): OptionValue;
}

export enum OptionType {
  VALUE,
  FLAG,
  CUSTOM_VARIABLE,
}

export type OptionValue = string | boolean | undefined;
