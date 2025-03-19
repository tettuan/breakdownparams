// パラメータの種類
export type ParamsType = "no-params" | "single" | "double";

/**
 * Result type for when no parameters are provided
 */
export interface NoParamsResult {
  type: "no-params";
  help?: boolean;
  version?: boolean;
  error?: string;
}

/**
 * Result type for when a single parameter is provided
 */
export interface SingleParamResult {
  type: "single";
  command?: "init";
  options?: OptionParams;
  error?: string;
}

/**
 * Result type for when two parameters are provided
 */
export interface DoubleParamsResult {
  type: "double";
  demonstrativeType?: DemonstrativeType;
  layerType?: LayerType;
  options?: OptionParams;
  error?: string;
}

/**
 * Union type of all possible parameter result types
 */
export type ParamsResult = NoParamsResult | SingleParamResult | DoubleParamsResult;

// オプション
export interface OptionParams {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
}

// 値の定義
export type DemonstrativeType = "to" | "summary" | "defect";
export type LayerType = "project" | "issue" | "task";

// エイリアスマッピング
export const LayerTypeAliasMap = {
  // project aliases
  "project": "project",
  "pj": "project",
  "prj": "project",
  "p": "project",
  // issue aliases
  "issue": "issue",
  "story": "issue",
  "i": "issue",
  "iss": "issue",
  // task aliases
  "task": "task",
  "todo": "task",
  "chore": "task",
  "style": "task",
  "fix": "task",
  "error": "task",
  "bug": "task",
  "t": "task"
} as const;

export type FromLayerTypeAlias = keyof typeof LayerTypeAliasMap; 