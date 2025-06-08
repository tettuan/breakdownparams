/**
 * パラメータ結果の基本型
 */
export interface ParamsResult {
  type: 'zero' | 'one' | 'two' | 'error';
  params: string[];
  options: Record<string, unknown>;
  error?: ErrorInfo;
}

/**
 * パラメータなしの結果
 */
export interface ZeroParamsResult extends ParamsResult {
  type: 'zero';
}

/**
 * 単一パラメータの結果
 */
export interface OneParamResult extends ParamsResult {
  type: 'one';
  demonstrativeType: string;
}

/**
 * 二重パラメータの結果
 */
export interface TwoParamResult extends ParamsResult {
  type: 'two';
  demonstrativeType: string;
  layerType: string;
}

/**
 * エラー結果
 */
export interface ErrorResult {
  type: 'error';
  params: string[];
  options: Record<string, unknown>;
  error: ErrorInfo;
}

/**
 * エラー情報
 */
export interface ErrorInfo {
  message: string;
  code: string;
  category: string;
} 