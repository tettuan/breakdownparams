import { ValidationResult } from './validation_result.ts';

/**
 * オプションタイプ
 */
export enum OptionType {
  /** 値を持つオプション */
  VALUE = 'value',
  /** フラグオプション */
  FLAG = 'flag',
  /** カスタム変数オプション */
  CUSTOM_VARIABLE = 'custom_variable',
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
