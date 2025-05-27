export type LayerType = 'project' | 'issue' | 'task';
export type DemonstrativeType = 'to' | 'summary' | 'defect';

export type ErrorResult = {
  message: string;
  code: string;
};

export type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
  adaptationType?: string;
  configFile?: string;
  customVariables?: Record<string, string>;
};

export type NoParamsResult = {
  type: 'no-params';
  help: boolean;
  version: boolean;
  error?: ErrorResult;
};

export type SingleParamResult = {
  type: 'single';
  command: 'init';
  options: OptionParams;
  error?: ErrorResult;
};

export type DoubleParamsResult = {
  type: 'double';
  demonstrativeType: DemonstrativeType;
  layerType: LayerType;
  options: OptionParams;
  error?: ErrorResult;
};

export type ParamsResult = NoParamsResult | SingleParamResult | DoubleParamsResult;

export type ParserConfig = {
  isExtendedMode?: boolean;
  demonstrativeType?: {
    pattern?: string;
  };
};
