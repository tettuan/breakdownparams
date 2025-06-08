import { ValidationResult as ResultValidationResult } from '../result/types.ts';

/**
 * オプションタイプ
 */
export enum OptionType {
  VALUE = 'value',
  FLAG = 'flag',
  CUSTOM_VARIABLE = 'custom_variable',
}

/**
 * オプションの基本インターフェース
 */
export interface Option {
  type: OptionType;
  name: string;
  aliases: string[];
  description: string;
  isRequired: boolean;
  validate(value: unknown): ResultValidationResult;
  parse(value: unknown): unknown;
}

export type OptionValue = string | boolean | undefined;
