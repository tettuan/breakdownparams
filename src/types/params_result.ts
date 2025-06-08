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
 * 
 * このインターフェースは、パラメータ解析の最終結果として利用者に返却される
 * エラー情報を定義します。内部処理で発生するエラーは、この形式に変換されて
 * 返却されます。
 * 
 * エラー情報は以下の3つのレベルで発生します：
 * 1. パラメータエラー: パラメータの形式や値が不正な場合
 * 2. オプションエラー: オプションの形式や値が不正な場合
 * 3. 組み合わせエラー: パラメータとオプションの組み合わせが不正な場合
 * 
 * エラー情報は、ParamsParserによって作成され、利用者に返却されます。
 * バリデータから直接エラー情報を受け取ることは禁止されています。
 */
export interface ErrorInfo {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code: string;
  /** エラーのカテゴリ */
  category: string;
} 