/**
 * Type representing the different kinds of parameter combinations that can be parsed.
 * - 'no-params': No parameters provided, may include help or version flags
 * - 'single': Single command parameter (e.g., 'init')
 * - 'double': Two parameters (demonstrative type and layer type)
 * - 'error': Indicates an error in the parameter parsing process
 */
export type ParamsType = 'no-params' | 'single' | 'double' | 'error';

/**
 * Categories of errors that can occur during parameter parsing
 */
export type ErrorCategory =
  | 'VALIDATION' // Input validation errors
  | 'SECURITY' // Security-related errors
  | 'CONFIGURATION' // Configuration-related errors
  | 'SYNTAX' // Syntax-related errors
  | 'UNEXPECTED'; // Unexpected errors

/**
 * Error codes for parameter parsing
 */
export type ErrorCode =
  // Validation errors
  | 'INVALID_DEMONSTRATIVE_TYPE'
  | 'INVALID_LAYER_TYPE'
  | 'INVALID_COMMAND'
  | 'INVALID_OPTION'
  | 'INVALID_CUSTOM_VARIABLE_NAME'
  | 'MISSING_VALUE_FOR_OPTION'
  | 'MISSING_VALUE_FOR_CUSTOM_VARIABLE'
  | 'VALUE_TOO_LONG'
  | 'TOO_MANY_CUSTOM_VARIABLES'
  // Security errors
  | 'SECURITY_ERROR'
  // Configuration errors
  | 'INVALID_CONFIG'
  | 'INVALID_PATTERN'
  // Syntax errors
  | 'TOO_MANY_ARGUMENTS'
  | 'UNKNOWN_OPTION'
  // Unexpected errors
  | 'UNEXPECTED_ERROR';

/**
 * Result type for when no parameters are provided
 */
export interface ErrorInfo {
  message: string;
  code: ErrorCode;
  category: ErrorCategory;
  details?: Record<string, unknown>;
}

export interface NoParamsResult {
  type: 'no-params';
  help: boolean;
  version: boolean;
  error?: ErrorInfo;
}

/**
 * Result type for when a single parameter is provided
 */
export interface SingleParamResult {
  type: 'single';
  command: 'init';
  options: OptionParams;
  error?: ErrorInfo;
}

/**
 * Result type for when two parameters are provided
 */
export interface DoubleParamsResult {
  type: 'double';
  demonstrativeType: DemonstrativeType;
  layerType: LayerType;
  options: OptionParams;
  error?: ErrorInfo;
}

/**
 * Union type of all possible parameter result types
 */
export type ParamsResult =
  | NoParamsResult
  | SingleParamResult
  | DoubleParamsResult;

/**
 * Interface representing optional parameters that can be provided with commands.
 * These options can be specified using either long form (--option) or short form (-o).
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
 * - 'to': Convert to a specified layer
 * - 'summary': Generate a summary for a layer
 * - 'defect': Report defects for a layer
 */
export type DemonstrativeType = 'to' | 'summary' | 'defect';

/**
 * Type representing the available layer types in the breakdown structure.
 * - 'project': Project level items
 * - 'issue': Issue/story level items
 * - 'task': Task/todo level items
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
 */
export type FromLayerTypeAlias = keyof typeof LayerTypeAliasMap;

/**
 * Interface representing the configuration for the ParamsParser.
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
