import { BaseValidator } from "../core/errors/validators/base_validator.ts";
import { ErrorCode, ErrorCategory } from "../core/errors/types.ts";
import { ERROR_CODES, ERROR_CATEGORIES } from "../core/errors/constants.ts";
import { SecurityErrorValidator } from "./security_error_validator.ts";
import { ParseResult, ParamPatternResult } from "../core/params/definitions/types.ts";

/**
 * Validator for custom variables
 * 
 * This validator checks if a custom variable name and value are valid.
 * It validates:
 * - Variable name format (alphanumeric and underscores only)
 * - Value length (max 1000 characters)
 * - Forbidden characters in value
 * 
 * @since 1.0.0
 */
export class CustomVariableValidator extends BaseValidator {
  private readonly maxValueLength: number;
  private readonly securityValidator: SecurityErrorValidator;

  constructor() {
    super(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
    this.maxValueLength = 100;
    this.securityValidator = new SecurityErrorValidator();
  }

  canHandle(args: string[]): boolean {
    return args.some(arg => arg.startsWith("--uv-"));
  }

  validate(args: string[]): ParseResult<ParamPatternResult> {
    const varName = args[0]?.split("=")[0]?.replace("--uv-", "");
    if (!varName) {
      return this.createErrorResult("Invalid custom variable name");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(varName)) {
      return this.createErrorResult("Custom variable name contains invalid characters");
    }

    const varValue = args[0]?.split("=")[1];
    if (varValue && varValue.length > this.maxValueLength) {
      return this.createErrorResult(`Custom variable value exceeds maximum length of ${this.maxValueLength}`);
    }

    const securityError = this.securityValidator.validate([varValue || ""]);
    if (!securityError.success) {
      return this.createErrorResult("Security violation detected in custom variable value", {
        name: varName,
        location: `customVariableValue:${varName}`
      });
    }

    return this.createSuccessResult({
      type: 'zero',
      help: false,
      version: false
    });
  }
} 