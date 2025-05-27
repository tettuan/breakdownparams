import { ParamPatternResult, ParseResult } from '../types.ts';

/**
 * Interface for parameter pattern validators
 */
export interface ParamPatternValidator {
  /**
   * Validates the parameter pattern
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ParamPatternResult>;
}

/**
 * Interface for zero parameter validators
 */
export interface ZeroParamValidator extends ParamPatternValidator {
  /**
   * Validates zero parameters
   * @param args The arguments to validate
   * @returns The validation result
   */
  validateZeroParams(args: string[]): ParseResult<ParamPatternResult>;
}

/**
 * Interface for one parameter validators
 */
export interface OneParamValidator extends ParamPatternValidator {
  /**
   * Validates one parameter
   * @param args The arguments to validate
   * @returns The validation result
   */
  validateOneParam(args: string[]): ParseResult<ParamPatternResult>;
}

/**
 * Interface for two parameters validators
 */
export interface TwoParamValidator extends ParamPatternValidator {
  /**
   * Validates two parameters
   * @param args The arguments to validate
   * @returns The validation result
   */
  validateTwoParams(args: string[]): ParseResult<ParamPatternResult>;
}

/**
 * Validator for security-related errors
 */
export interface SecurityErrorValidator extends ParamPatternValidator {
  /**
   * Validates arguments for security issues
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ParamPatternResult>;
}
