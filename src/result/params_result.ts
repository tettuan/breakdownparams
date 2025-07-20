import { OptionParams } from '../types/option_type.ts';

/**
 * Base interface for parameter results
 */
export interface ParamsResult {
  /**
   * Whether the validation was successful
   */
  isValid: boolean;

  /**
   * Error message if validation failed
   */
  error?: string;

  /**
   * Parsed options
   */
  options: OptionParams;
}

/**
 * Result for zero parameters (help/version commands)
 */
export interface ZeroParamsResult extends ParamsResult {
  type: 'zero';
}

/**
 * Result for one parameter (init command)
 */
export interface OneParamsResult extends ParamsResult {
  type: 'one';
  param: string;
}

/**
 * Result for two parameters (main functionality)
 */
export interface TwoParamsResult extends ParamsResult {
  type: 'two';
  directiveType: string;
  layerType: string;
}
