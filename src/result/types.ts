/**
 * パラメータ解析結果の基本インターフェース
 */
export interface ParamsResult {
  type: 'zero' | 'one' | 'two' | 'error';
  params: string[];
  options: Record<string, string | undefined>;
  error?: ErrorInfo;
}

/**
 * エラー情報を保持するインターフェース
 */
export interface ErrorInfo {
  message: string;
  code: string;
  category: string;
}

/**
 * 位置引数なしのパラメータ結果
 */
export interface ZeroParamsResult extends ParamsResult {
  type: 'zero';
}

/**
 * 位置引数1つのパラメータ結果
 */
export interface OneParamResult extends ParamsResult {
  type: 'one';
  demonstrativeType: string;
}

/**
 * 位置引数2つのパラメータ結果
 */
export interface TwoParamResult extends ParamsResult {
  type: 'two';
  demonstrativeType: string;
  layerType: string;
}

/**
 * バリデーション結果を保持するインターフェース
 */
export interface ValidationResult {
  isValid: boolean;
  validatedParams: string[];
  error?: ErrorInfo;
  errorMessage?: string;
  errorCode?: string;
  errorCategory?: string;
  errorDetails?: Record<string, unknown>;
  demonstrativeType?: string;
  layerType?: string;
  options?: Record<string, string>;
}

/**
 * オプション処理ルールを定義するインターフェース
 */
export interface OptionRule {
  format: string;
  validation: {
    customVariables: string[];
    emptyValue: 'error' | 'warn' | 'ignore';
    unknownOption: 'error' | 'warn' | 'ignore';
    duplicateOption: 'error' | 'warn' | 'ignore';
    requiredOptions: string[];
    valueTypes: string[];
  };
  flagOptions: Record<string, string>;
}
