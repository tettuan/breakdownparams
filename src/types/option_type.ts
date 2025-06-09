import { ValidationResult } from './validation_result.ts';

/**
 * オプションタイプ
 */
export enum OptionType {
  /** 値を持つオプション */
  VALUE = 'value',
  /** フラグオプション */
  FLAG = 'flag',
  /** ユーザー変数オプション */
  USER_VARIABLE = 'user_variable',
}

/**
 * オプションの基本インターフェース
 */
export interface Option {
  /** オプションの種類 */
  type: OptionType;
  /** オプション名 */
  name: string;
  /** オプションの別名リスト */
  aliases: string[];
  /** オプションの説明 */
  description: string;
  /** 必須オプションかどうか */
  isRequired: boolean;
  /** 値のバリデーション関数 */
  validate(value?: unknown): ValidationResult;
  /** 値のパース関数（オプション） */
  parse?(value: unknown): unknown;
  
  // New methods for enhanced functionality
  /** Check if the input is in shorthand form */
  isShorthand(): boolean;
  /** Check if the input is in long form */
  isLongForm(): boolean;
  /** Check if this is a user variable option */
  isCustomVariable(): boolean;
  /** Check if an input string matches this option */
  matchesInput(input: string): boolean;
  /** Get the normalized (canonical) name */
  toNormalized(): string;
  /** Get the long form representation */
  toLong(): string;
  /** Get the short form representation (if available) */
  toShort(): string | undefined;
  /** Get the value */
  getValue(): string | boolean;
}

/**
 * オプション値の型
 */
export type OptionValue = string | boolean | undefined;

/**
 * Type for parsed options
 */
export interface OptionParams {
  /** Source file path */
  fromFile?: string;

  /** Output file path */
  destinationFile?: string;

  /** Input layer type */
  fromLayerType?: string;

  /** Prompt adaptation type */
  adaptationType?: string;

  /** Configuration file name */
  configFile?: string;

  /** Custom variables */
  customVariables?: Record<string, string>;
}
