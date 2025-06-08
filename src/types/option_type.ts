import { ValidationResult } from './validation_result.ts';

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
  validate(value: unknown): ValidationResult;
  parse(value: unknown): unknown;
}

export type OptionValue = string | boolean | undefined;

/**
 * Type for parsed options
 */
export interface OptionParams {
  /**
   * Source file path
   */
  fromFile?: string;

  /**
   * Output file path
   */
  destinationFile?: string;

  /**
   * Input layer type
   */
  fromLayerType?: string;

  /**
   * Prompt adaptation type
   */
  adaptationType?: string;

  /**
   * Configuration file name
   */
  configFile?: string;

  /**
   * Custom variables
   */
  customVariables?: Record<string, string>;
} 