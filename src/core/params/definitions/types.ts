import { Result, ErrorInfo } from '../../errors/types.ts';
import { ErrorInfo as OldErrorInfo, ErrorResult, ErrorCode, ErrorCategory } from '../../errors/types.ts';

/**
 * Type representing the different kinds of parameter combinations that can be parsed.
 * This type is used to categorize the command line arguments into distinct patterns.
 *
 * @since 1.0.0
 */
export type ParamsType = 'no-params' | 'single' | 'double' | 'error';

/**
 * Result for zero parameters case
 */
export interface ZeroParamResult {
  type: 'zero';
  help: boolean;
  version: boolean;
  error?: ErrorInfo;
}

/**
 * Result for one parameter case
 */
export interface OneParamResult {
  type: 'one';
  command: string;
  options: Record<string, string>;
  error?: ErrorInfo;
}

/**
 * Result for two parameters case
 */
export interface TwoParamResult {
  type: 'two';
  demonstrativeType: string;
  layerType: string;
  options: Record<string, string | boolean>;
  error?: ErrorInfo;
}

/**
 * Base type for all parameter pattern results
 */
export type ParamPatternResult =
  | ZeroParamResult
  | OneParamResult
  | TwoParamResult;

/**
 * Result of parsing parameters
 */
export type ParseResult<T extends ParamPatternResult> = Result<T> & {
  args?: string[];
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

/**
 * Interface representing optional parameters that can be provided with commands.
 * These options can be specified using either long form (--option) or short form (-o).
 *
 * @since 1.0.0
 */
export interface OptionParams {
  /** The input file path when specified with --from or -f */
  fromFile?: string;
  /** The output file path when specified with --destination or -o */
  destinationFile?: string;
  /** The source layer type when specified with --input or -i */
  fromLayerType?: LayerType;
  /** The prompt adaptation type when specified with --adaptation or -a */
  adaptationType?: string;
  /** The configuration file name when specified with --config or -c */
  configFile?: string;
  /** Custom variables specified with --uv-* options */
  customVariables?: Record<string, string>;
  /** Index signature for dynamic option keys */
  [key: string]: string | LayerType | Record<string, string> | undefined;
}

export const DEMONSTRATIVE_TYPES = ['to', 'summary', 'defect'] as const;
export type DemonstrativeType = typeof DEMONSTRATIVE_TYPES[number];

export const LAYER_TYPES = ['project', 'issue', 'task'] as const;
export type LayerType = typeof LAYER_TYPES[number];

/**
 * Interface representing the configuration for the ParamsParser.
 * This interface defines the configuration options that can be used to customize
 * the behavior of the parameter parser.
 *
 * @since 1.0.0
 */
export interface ParserConfig {
  /** Whether to enable extended mode for custom validation rules */
  isExtendedMode: boolean;

  /** Configuration for demonstrative type validation */
  demonstrativeType?: {
    /** Regular expression pattern for validation */
    pattern: string;
    /** Custom error message for validation failures */
    errorMessage?: string;
  };

  /** Configuration for layer type validation */
  layerType?: {
    /** Regular expression pattern for validation */
    pattern: string;
    /** Custom error message for validation failures */
    errorMessage?: string;
  };
}

/**
 * Interface for parameter validators
 * 
 * This interface defines the contract for all parameter validators in the system.
 * Each validator must implement the validate method that takes arguments and returns
 * a parse result containing either the validated parameters or an error.
 * 
 * @since 1.0.0
 */
export interface ParameterValidator {
  /**
   * Validates the given arguments and returns a parse result.
   * @param args - The command line arguments to validate
   * @returns A parse result containing either the validated parameters or an error
   */
  validate(args: string[]): ParseResult<ParamPatternResult>;

  /**
   * Determines if this validator can handle the given arguments.
   * @param args - The command line arguments to check
   * @returns True if this validator can handle the arguments, false otherwise
   */
  canHandle(args: string[]): boolean;
}

export type { ErrorInfo, ErrorResult, ErrorCode, ErrorCategory };
