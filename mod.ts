/**
 * A command line argument parser for breakdown tasks.
 * This module provides functionality to parse command line arguments
 * for task breakdown operations.
 * 
 * @module
 */

export { ParamsParser } from "./src/params_parser.ts";
export type {
  NoParamsResult,
  SingleParamResult,
  DoubleParamsResult,
  ParamsResult,
  DemonstrativeType,
  LayerType,
  OptionParams,
} from "./src/types.ts";

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
 * if ("command" in result) {
 *   console.log(`Command: ${result.command}`);
 * }
 * ```
 */ 