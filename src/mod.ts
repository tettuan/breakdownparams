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
 *   console.log(`Converting ${result.layerType} using ${result.demonstrativeType}`);
 * }
 * ```
 */

export { ParamsParser } from './params_parser.ts';
export type {
  DemonstrativeType,
  DoubleParamsResult,
  LayerTypeAliasMap,
  NoParamsResult,
  OptionParams,
  ParamsResult,
  SingleParamResult,
} from './types.ts';
