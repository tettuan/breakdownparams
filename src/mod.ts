import { BreakdownLogger } from "@tettuan/breakdownlogger";

export { ParamsParser } from "./params_parser.ts";
export type {
  ParamsResult,
  NoParamsResult,
  SingleParamResult,
  DoubleParamsResult,
  DemonstrativeType,
  OptionParams,
  LayerTypeAliasMap,
} from "./types.ts";

// Example usage of BreakdownLogger
const logger = new BreakdownLogger({
  name: "breakdownparams",
  level: "debug",
});

logger.info("Initializing breakdownparams..."); 