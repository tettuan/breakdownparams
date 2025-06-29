/**
 * Core library exports for @tettuan/breakdownparams
 *
 * This module provides the main API for parsing and validating command-line parameters
 * with support for custom configuration and type-safe results.
 */

// メインパーサークラス - コマンドライン引数の解析とバリデーションに使用
export { ParamsParser } from './parser/params_parser.ts';

// 結果型定義 - パーサーの戻り値として使用する型安全な結果オブジェクト
export type {
  ErrorInfo, // エラー情報の型定義
  OneParamsResult, // 単一パラメータ実行時の結果型
  ParamsResult, // 全パラメータパターンの統合結果型
  TwoParamsResult, // 二重パラメータ実行時の結果型
  ZeroParamsResult, // パラメータなし実行時の結果型
} from './types/params_result.ts';

// カスタム設定型 - パーサーの動作をカスタマイズする際の型定義
export type { CustomConfig } from './types/custom_config.ts';

// デフォルト設定値 - カスタム設定作成時のベースとして使用
// スプレッド演算子で部分的にオーバーライドして利用: { ...DEFAULT_CUSTOM_CONFIG, params: {...} }
export { DEFAULT_CUSTOM_CONFIG } from './types/custom_config.ts';
