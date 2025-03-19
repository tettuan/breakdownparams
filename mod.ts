/**
 * A utility to parse and validate command line arguments with type safety.
 * 
 * This module provides a type-safe way to parse command line arguments,
 * supporting various parameter types and validation rules.
 * 
 * @example
 * ```ts
 * import { ParamsParser } from "@tettuan/breakdownparams";
 * 
 * const parser = new ParamsParser({
 *   command: "my-cli",
 *   help: "A command line tool",
 *   version: "1.0.0",
 *   demonstrativeType: "command",
 * });
 * 
 * const result = parser.parse(Deno.args);
 * if (result.type === "success") {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 * 
 * @module
 */

export * from "./src/params_parser.ts";
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