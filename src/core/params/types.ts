import { Result, ErrorInfo } from '../errors/types.ts';

/**
 * Result of parsing parameters
 */
export type ParseResult<T> = Result<T>;

/**
 * Base type for all parameter pattern results
 */
export type ParamPatternResult = ZeroParamResult | OneParamResult | TwoParamResult;

/**
 * Result for zero parameters case
 */
export type ZeroParamResult = {
  type: 'zero';
  help: boolean;
  version: boolean;
  error?: ErrorInfo;
};

/**
 * Result for one parameter case
 */
export type OneParamResult = {
  type: 'one';
  command: string;
  options: Record<string, string>;
  error?: ErrorInfo;
};

/**
 * Result for two parameters case
 */
export type TwoParamResult = {
  type: 'two';
  demonstrativeType: string;
  layerType: string;
  options: Record<string, string | boolean>;
  error?: ErrorInfo;
};

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