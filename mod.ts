/**
 * A module for parsing and validating command line arguments in a type-safe manner.
 *
 * This module provides:
 * - {@link ParamsParser} class for parsing command line arguments
 * - Type definitions for parameter results and options
 * - Layer type aliases and demonstrative type definitions
 *
 * @example
 * ```ts
 * import { ParamsParser } from "@tettuan/breakdownparams";
 *
 * const parser = new ParamsParser();
 * const result = parser.parse(Deno.args);
 *
 * if (result.type === "two") {
 *   // Process the parameters
 *   const { demonstrativeType, layerType, options } = result;
 *   // Handle the conversion
 * } else if (result.error) {
 *   // Handle error case
 * }
 * ```
 */

export { ParamsParser } from './src/parser/params_parser.ts';
export type {
  ErrorInfo,
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from './src/types/params_result.ts';
export type { OptionRule } from './src/types/option_rule.ts';
export type { ValidationResult } from './src/types/validation_result.ts';

/**
 * @module breakdownparams
 *
 * A command-line argument parser for handling parameter breakdown in a structured way.
 * This module provides functionality to parse and validate command-line arguments
 * with support for different parameter combinations.
 *
 * @example
 * ```ts
 * import { ParamsParser } from "@tettuan/breakdownparams";
 *
 * const parser = new ParamsParser();
 * const result = parser.parse(Deno.args);
 *
 * if (result.type === "two") {
 *   // Process the parameters
 *   const { demonstrativeType, layerType, options } = result;
 *   // Handle the conversion
 * } else if (result.error) {
 *   // Handle error case
 * }
 * ```
 */
