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
 * if (result.type === "double") {
 *   // Process the parameters
 *   const { demonstrativeType, layerType, options } = result;
 *   // Handle the conversion
 * } else if (result.error) {
 *   // Handle error case
 * }
 * ```
 */

export { ParamsParser } from './src/params_parser.ts';
export type {
  DemonstrativeType,
  LayerType,
  OneParamResult,
  OptionParams,
  ParamPatternResult,
  TwoParamResult,
  ZeroParamResult,
} from './src/core/params/definitions/types.ts';

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
 * if (result.type === "double") {
 *   // Process the parameters
 *   const { demonstrativeType, layerType, options } = result;
 *   // Handle the conversion
 * } else if (result.error) {
 *   // Handle error case
 * }
 * ```
 */
