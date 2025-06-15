import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../../types/validation_result.ts';
import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';

/**
 * Validator for two-parameter commands.
 *
 * This validator ensures exactly two parameters are provided and validates them
 * against configurable patterns for DemonstrativeType and LayerType.
 *
 * Validation process:
 * 1. Checks that exactly 2 parameters are provided
 * 2. Validates first parameter against DemonstrativeType pattern (default: to|summary|defect)
 * 3. Validates second parameter against LayerType pattern (default: project|issue|task)
 * 4. Returns both demonstrativeType and layerType in the result
 *
 * Configuration:
 * - Custom patterns and error messages can be provided via CustomConfig
 * - Falls back to DEFAULT_CUSTOM_CONFIG if not provided
 * - Default patterns: "^(to|summary|defect)$" and "^(project|issue|task)$"
 *
 * @extends BaseValidator
 *
 * @example
 * ```ts
 * const validator = new TwoParamsValidator();
 *
 * // Valid combination
 * validator.validate(["to", "project"]);
 * // { isValid: true, demonstrativeType: "to", layerType: "project" }
 *
 * // Invalid demonstrative type
 * validator.validate(["invalid", "project"]);
 * // { isValid: false, errorMessage: "Invalid demonstrative type: invalid" }
 *
 * // Custom configuration
 * const customValidator = new TwoParamsValidator({
 *   params: {
 *     two: {
 *       demonstrativeType: { pattern: "^(custom1|custom2)$", errorMessage: "Invalid custom type" },
 *       layerType: { pattern: "^(layer1|layer2)$", errorMessage: "Invalid layer" }
 *     }
 *   }
 * });
 * ```
 */
export class TwoParamsValidator extends BaseValidator {
  private readonly config: CustomConfig;

  /**
   * Creates a new TwoParamsValidator instance.
   *
   * @param config - Optional configuration for validation patterns and error messages
   */
  constructor(config?: CustomConfig) {
    super();
    this.config = config || DEFAULT_CUSTOM_CONFIG;
  }

  /**
   * Validates that exactly two parameters are provided and match configured patterns.
   *
   * Validation flow:
   * 1. Ensures exactly 2 parameters are provided
   * 2. Validates first parameter against DemonstrativeType pattern
   * 3. Validates second parameter against LayerType pattern
   * 4. Returns appropriate error message if validation fails
   * 5. Returns validated parameters with type information on success
   *
   * @param params - Array of parameters to validate
   * @returns Validation result with demonstrativeType and layerType if valid
   *
   * @example
   * ```ts
   * const result = validator.validate(["summary", "task"]);
   * if (result.isValid) {
   *   // result.demonstrativeType === "summary"
   *   // result.layerType === "task"
   * }
   * ```
   */
  override validate(params: string[]): ValidationResult {
    // パラメータの数が2個でない場合はエラー
    if (params.length !== 2) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly two parameters',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation',
      };
    }

    // DemonstrativeType と LayerType のパターンを取得
    // 優先順位: 1. config の設定 2. デフォルト設定 3. ハードコードされたデフォルト値
    const demonstrativePattern = this.config.params.two.demonstrativeType.pattern ||
      '^(to|summary|defect)$';
    const layerPattern = this.config.params.two.layerType.pattern || '^(project|issue|task)$';

    // パターンマッチングで検証
    const demonstrativeValid = new RegExp(demonstrativePattern).test(params[0]);
    const layerValid = new RegExp(layerPattern).test(params[1]);

    // どちらかが一致しない場合はエラー
    if (!demonstrativeValid || !layerValid) {
      return {
        isValid: false,
        validatedParams: params,
        demonstrativeType: params[0],
        layerType: params[1],
        errorMessage: !demonstrativeValid
          ? (this.config.params.two.demonstrativeType.errorMessage ||
            `Invalid demonstrative type: ${params[0]}`)
          : (this.config.params.two.layerType.errorMessage ||
            `Invalid layer type: ${params[1]}`),
        errorCode: !demonstrativeValid ? 'INVALID_DEMONSTRATIVE_TYPE' : 'INVALID_LAYER_TYPE',
        errorCategory: 'validation',
      };
    }

    // 検証成功時は、検証済みパラメータと型情報を返す
    return {
      isValid: true,
      validatedParams: params,
      demonstrativeType: params[0],
      layerType: params[1],
    };
  }
}
