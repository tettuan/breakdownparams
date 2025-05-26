import { BaseValidator } from "../core/errors/validators/base_validator.ts";
import { ERROR_CODES, ERROR_CATEGORIES } from "../core/errors/constants.ts";
import { ParseResult, ParamPatternResult } from "../core/params/definitions/types.ts";

/**
 * Validator for required fields
 * 
 * This validator checks if a required field is present and not empty.
 * It can be used for both string values and array values.
 * 
 * @since 1.0.0
 */
export class RequiredFieldValidator extends BaseValidator {
  private readonly fieldName: string;

  constructor(fieldName: string) {
    super(ERROR_CODES.MISSING_REQUIRED_ARGUMENT, ERROR_CATEGORIES.VALIDATION);
    this.fieldName = fieldName;
  }

  canHandle(args: string[]): boolean {
    return args.length > 0;
  }

  validate(args: string[]): ParseResult<ParamPatternResult> {
    const value = args[0];
    if (!value || value.trim() === "" || value === "{}" || value === "[]") {
      return this.createErrorResult(`${this.fieldName} is required`);
    }

    return this.createSuccessResult({
      type: 'zero',
      help: false,
      version: false
    });
  }
} 