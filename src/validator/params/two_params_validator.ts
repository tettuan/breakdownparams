import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../../types/validation_result.ts';
import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';

/**
 * Validator for two-parameter commands.
 *
 * This validator ensures exactly two parameters are provided and validates them
 * against configurable patterns for DirectiveType and LayerType.
 *
 * Validation process:
 * 1. Checks that exactly 2 parameters are provided
 * 2. Validates first parameter against DirectiveType pattern (default: to|summary|defect)
 * 3. Validates second parameter against LayerType pattern (default: project|issue|task)
 * 4. Returns both directiveType and layerType in the result
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
 * // { isValid: true, directiveType: "to", layerType: "project" }
 *
 * // Invalid directive type
 * validator.validate(["invalid", "project"]);
 * // { isValid: false, errorMessage: "Invalid directive type: invalid" }
 *
 * // Custom configuration
 * const customValidator = new TwoParamsValidator({
 *   params: {
 *     two: {
 *       directiveType: { pattern: "^(custom1|custom2)$", errorMessage: "Invalid custom type" },
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
   * 2. Validates first parameter against DirectiveType pattern
   * 3. Validates second parameter against LayerType pattern
   * 4. Returns appropriate error message if validation fails
   * 5. Returns validated parameters with type information on success
   *
   * @param params - Array of parameters to validate
   * @returns Validation result with directiveType and layerType if valid
   *
   * @example
   * ```ts
   * const result = validator.validate(["summary", "task"]);
   * if (result.isValid) {
   *   // result.directiveType === "summary"
   *   // result.layerType === "task"
   * }
   * ```
   */
  override validate(params: string[]): ValidationResult {
    // Error if not exactly 2 parameters
    if (params.length !== 2) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly two parameters',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation',
      };
    }

    // Get DirectiveType and LayerType patterns
    // Priority: 1. config settings 2. default settings 3. hardcoded default values
    const directivePattern = this.config.params.two.directiveType.pattern ||
      '^(to|summary|defect)$';
    const layerPattern = this.config.params.two.layerType.pattern || '^(project|issue|task)$';

    // Validate with pattern matching
    const directiveValid = new RegExp(directivePattern).test(params[0]);
    const layerValid = new RegExp(layerPattern).test(params[1]);

    // Error if either doesn't match
    if (!directiveValid || !layerValid) {
      return {
        isValid: false,
        validatedParams: params,
        directiveType: params[0],
        layerType: params[1],
        errorMessage: !directiveValid
          ? (this.config.params.two.directiveType.errorMessage ||
            `Invalid directive type: ${params[0]}`)
          : (this.config.params.two.layerType.errorMessage ||
            `Invalid layer type: ${params[1]}`),
        errorCode: !directiveValid ? 'INVALID_DIRECTIVE_TYPE' : 'INVALID_LAYER_TYPE',
        errorCategory: 'validation',
      };
    }

    // On successful validation, return validated parameters with type information
    return {
      isValid: true,
      validatedParams: params,
      directiveType: params[0],
      layerType: params[1],
    };
  }
}
