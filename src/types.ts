/**
 * Type of parameter pattern based on the number of non-hyphenated parameters.
 * - 'no-params': No parameters or only flags
 * - 'single': Single parameter (e.g., 'init' command)
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
export type ParamsResult = NoParamsResult | SingleParamResult | DoubleParamsResult;

/**
 * Optional parameters that can be provided with any command.
 * These are specified using either long form (--option) or short form (-o) flags.
 */
export interface OptionParams {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
}

/**
 * Valid demonstrative types that indicate the action or purpose.
 * - 'to': Convert or transform to another format
 * - 'summary': Generate a summary
 * - 'defect': Report or analyze defects
 */
export type DemonstrativeType = 'to' | 'summary' | 'defect';

/**
 * Valid layer types that represent different levels of task breakdown.
 * - 'project': Project level tasks or components
 * - 'issue': Issue or story level items
 * - 'task': Individual tasks or work items
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
