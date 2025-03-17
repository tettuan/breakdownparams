// パラメータの種類
export type ParamsType = "no-params" | "single" | "double";

// 基本型
export interface ParamsResult {
  type: ParamsType;
  error?: string;
}

// パラメータなし
export interface NoParamsResult extends ParamsResult {
  type: "no-params";
  help: boolean;
  version: boolean;
}

// 単一パラメータ
export interface SingleParamResult extends ParamsResult {
  type: "single";
  command: "init";
}

// 2パラメータ
export interface DoubleParamsResult extends ParamsResult {
  type: "double";
  demonstrativeType: DemonstrativeType;
  layerType: LayerType;
  options: OptionParams;
}

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
  // issue aliases
  "issue": "issue",
  "story": "issue",
  // task aliases
  "task": "task",
  "todo": "task",
  "chore": "task",
  "style": "task",
  "fix": "task",
  "error": "task",
  "bug": "task"
} as const;

export type FromLayerTypeAlias = keyof typeof LayerTypeAliasMap; 