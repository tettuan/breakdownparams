/**
 * Type representing the different kinds of parameter combinations that can be parsed.
 * This type is used to categorize the command line arguments into distinct patterns.
 *
 * @since 1.0.0
 */
export type ParamsType = 'no-params' | 'single' | 'double' | 'error';

/**
 * Categories of errors that can occur during parameter parsing.
 * These categories help in organizing and handling different types of errors.
 *
 * @since 1.0.0
 */
export type ErrorCategory =
  | 'VALIDATION' // Input validation errors
  | 'SECURITY' // Security-related errors
  | 'CONFIGURATION' // Configuration-related errors
  | 'SYNTAX' // Syntax-related errors
  | 'UNEXPECTED';

/**
 * Error codes for parameter parsing.
 * These codes provide specific identification for different error scenarios.
 *
 * @since 1.0.0
 */
export type ErrorCode =
  // Validation errors (unified error codes)
  | 'VALIDATION_ERROR'
  | 'INVALID_COMMAND'
  | 'INVALID_OPTION'
  | 'INVALID_CUSTOM_VARIABLE_NAME'
  | 'MISSING_VALUE_FOR_OPTION'
  | 'MISSING_VALUE_FOR_CUSTOM_VARIABLE'
  | 'VALUE_TOO_LONG'
  | 'TOO_MANY_CUSTOM_VARIABLES'
  // Configuration errors
  | 'INVALID_CONFIG'
  | 'INVALID_PATTERN'
  // Syntax errors
  | 'TOO_MANY_ARGUMENTS'
  // Unexpected errors
  | 'UNEXPECTED_ERROR';

/**
 * Interface representing detailed error information.
 * This interface provides comprehensive error details for debugging and error handling.
 *
 * @since 1.0.0
 */
export interface ErrorInfo {
  /** Human-readable error message */
  message: string;
  /** Specific error code for programmatic handling */
  code: ErrorCode;
  /** Category of the error for error handling strategy */
  category: ErrorCategory;
  /** Additional error details for debugging */
  details?: Record<string, unknown>;
}

/**
 * Result type for when no parameters are provided.
 * This type is used when the command is run without any arguments,
 * potentially including help or version flags.
 *
 * @since 1.0.0
 */
export interface NoParamsResult {
  /** Type identifier for this result */
  type: 'no-params';
  /** Whether the help flag was specified */
  help: boolean;
  /** Whether the version flag was specified */
  version: boolean;
  /** Error information if any occurred */
  error?: ErrorInfo;
}

/**
 * Result type for when a single parameter is provided.
 * This type is used for commands like 'init' that take a single argument.
 *
 * @since 1.0.0
 */
export interface SingleParamResult {
  /** Type identifier for this result */
  type: 'single';
  /** The command that was specified */
  command: 'init';
  /** Optional parameters for the command */
  options: OptionParams;
  /** Error information if any occurred */
  error?: ErrorInfo;
}

/**
 * Result type for when two parameters are provided.
 * This type is used for commands that require both a demonstrative type and a layer type.
 *
 * @since 1.0.0
 */
export interface DoubleParamsResult {
  /** Type identifier for this result */
  type: 'double';
  /** The demonstrative type indicating the action to perform */
  demonstrativeType: DemonstrativeType;
  /** The layer type specifying the target layer */
  layerType: LayerType;
  /** Optional parameters for the command */
  options: OptionParams;
  /** Error information if any occurred */
  error?: ErrorInfo;
}

/**
 * Union type of all possible parameter result types.
 * This type represents all possible outcomes of parameter parsing.
 *
 * @since 1.0.0
 */
export type ParamsResult =
  | NoParamsResult
  | SingleParamResult
  | DoubleParamsResult;

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
}

/**
 * Type representing the available demonstrative types that indicate the action to perform.
 * These types define the main operations that can be performed on breakdown structures.
 *
 * @since 1.0.0
 */
export type DemonstrativeType = 'to' | 'summary' | 'defect';

/**
 * Type representing the available layer types in the breakdown structure.
 * These types define the different levels of granularity in the breakdown structure.
 *
 * @since 1.0.0
 */
export type LayerType = 'project' | 'issue' | 'task';

/**
 * Mapping of layer type aliases to their canonical layer types.
 * This constant maps various shorthand and alternative names to their standardized layer types.
 * For example, 'pj' and 'prj' both map to 'project'.
 */
export const LayerTypeAliasMap = {
  // project aliases
  'project': 'project',
  'pj': 'project',
  'prj': 'project',
  'p': 'project',
  // issue aliases
  'issue': 'issue',
  'story': 'issue',
  'i': 'issue',
  'iss': 'issue',
  // task aliases
  'task': 'task',
  'todo': 'task',
  'chore': 'task',
  'style': 'task',
  'fix': 'task',
  'error': 'task',
  'bug': 'task',
  't': 'task',
} as const;

/**
 * Type representing all possible layer type aliases.
 * This type is derived from the keys of LayerTypeAliasMap and includes all valid alias strings
 * that can be used to specify a layer type.
 *
 * @since 1.0.0
 */
export type FromLayerTypeAlias = keyof typeof LayerTypeAliasMap;

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
