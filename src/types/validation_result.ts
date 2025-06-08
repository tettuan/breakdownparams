/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  validatedParams: string[];
  errorMessage?: string;
  errorCode?: string;
  errorCategory?: string;
  errors?: string[];
  options?: Record<string, unknown>;
  demonstrativeType?: string;
  layerType?: string;
} 