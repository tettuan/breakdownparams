/**
 * Type representing the different kinds of parameter combinations that can be parsed.
 * - 'no-params': No parameters provided, may include help or version flags
 * - 'single': Single command parameter (e.g., 'init')
 * - 'double': Two parameters (demonstrative type and layer type)
 */
export type ParamsType = 'no-params' | 'single' | 'double';

/**
 * Result type for when no parameters are provided
 */
export interface NoParamsResult {
  type: 'no-params';
  help?: boolean;
  version?: boolean;
  error?: string;
}

/**
 * Result type for when a single parameter is provided
 */
export interface SingleParamResult {
  type: 'single';
  command?: 'init';
  options?: OptionParams;
  error?: string;
}

/**
 * Result type for when two parameters are provided
 */
export interface DoubleParamsResult {
  type: 'double';
  demonstrativeType?: DemonstrativeType;
  layerType?: LayerType;
  options?: OptionParams;
  error?: string;
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
