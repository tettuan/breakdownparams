/**
 * バリデーション結果
 */
export interface ValidationResult {
  /** バリデーションが成功したかどうか */
  isValid: boolean;
  /** バリデーション済みのパラメータ配列 */
  validatedParams: string[];
  /** エラーメッセージ */
  errorMessage?: string;
  /** エラーコード */
  errorCode?: string;
  /** エラーのカテゴリ */
  errorCategory?: string;
  /** エラーの詳細リスト */
  errors?: string[];
  /** オプションの設定値 */
  options?: Record<string, unknown>;
  /** 指示型の種類 */
  demonstrativeType?: string;
  /** レイヤーの種類 */
  layerType?: string;
} 