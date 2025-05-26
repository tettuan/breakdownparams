/**
 * A module for parsing and validating command line arguments in a type-safe manner.
 *
 * This module provides functionality for parsing command line arguments with strong type safety
 * and validation, specifically designed for managing breakdown structures in a hierarchical system.
 *
 * The module exports:
 * - {@link ParamsParser} class for parsing command line arguments
 * - Type definitions for parameter results and options
 * - Demonstrative type definitions
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
 *
 * @module
 * @since 1.0.0
 */

export { ParamsParser } from './params_parser.ts';

export type {
  DemonstrativeType,
  TwoParamResult,
  ErrorCategory,
  ErrorCode,
  ErrorInfo,
  LayerType,
  ZeroParamResult,
  OptionParams,
  ParamPatternResult,
  ParserConfig,
  OneParamResult,
} from './core/params/definitions/types.ts';
