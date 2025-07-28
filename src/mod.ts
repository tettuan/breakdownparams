/**
 * Core library exports for @tettuan/breakdownparams
 *
 * This module provides the main API for parsing and validating command-line parameters
 * with support for custom configuration and type-safe results.
 */

// Main parser class - Used for parsing and validating command-line arguments
export { ParamsParser } from './parser/params_parser.ts';

// Result type definitions - Type-safe result objects used as parser return values
export type {
  ErrorInfo, // Error information type definition
  OneParamsResult, // Result type for single parameter execution
  ParamsResult, // Unified result type for all parameter patterns
  TwoParamsResult, // Result type for two parameter execution
  ZeroParamsResult, // Result type for zero parameter execution
} from './types/params_result.ts';

// Custom configuration type - Type definition for customizing parser behavior
export type { CustomConfig } from './types/custom_config.ts';

// Default configuration values - Used as base for creating custom configurations
// Use spread operator to partially override: { ...DEFAULT_CUSTOM_CONFIG, params: {...} }
export { DEFAULT_CUSTOM_CONFIG } from './types/custom_config.ts';
