/**
 * パラメータ結果の基本型
 */
export interface ParamsResult {
  /** パラメータの種類を表す識別子 */
  type: 'zero' | 'one' | 'two' | 'error';
  /** パラメータの配列 */
  params: string[];
  /** オプションの設定値 */
  options: Record<string, unknown>;
  /** エラー情報（エラー時のみ） */
  error?: ErrorInfo;
}

/**
 * パラメータなしの結果
 */
export interface ZeroParamsResult extends ParamsResult {
  /** パラメータなしを示す識別子 */
  type: 'zero';
}

/**
 * 単一パラメータの結果
 */
export interface OneParamResult extends ParamsResult {
  /** 単一パラメータを示す識別子 */
  type: 'one';
  /** 指示型の種類 */
  demonstrativeType: string;
}

/**
 * 二重パラメータの結果
 */
export interface TwoParamResult extends ParamsResult {
  /** 二重パラメータを示す識別子 */
  type: 'two';
  /** 指示型の種類 */
  demonstrativeType: string;
  /** レイヤーの種類 */
  layerType: string;
}

/**
 * エラー結果
 */
export interface ErrorResult {
  /** エラーを示す識別子 */
  type: 'error';
  /** パラメータの配列 */
  params: string[];
  /** オプションの設定値 */
  options: Record<string, unknown>;
  /** エラー情報 */
  error: ErrorInfo;
}

/**
 * エラー情報
 */
export interface ErrorInfo {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code: string;
  /** エラーのカテゴリ */
  category: string;
} 