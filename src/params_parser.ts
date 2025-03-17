import { LayerTypeAliasMap } from "./types.ts";
import type {
  ParamsResult,
  NoParamsResult,
  SingleParamResult,
  DoubleParamsResult,
  DemonstrativeType,
  LayerType,
  FromLayerTypeAlias,
} from "./types.ts";

export class ParamsParser {
  private readonly demonstrativeTypes = new Set<string>(["to", "summary", "defect"]);
  private readonly validSingleCommands = new Set<string>(["init"]);

  /**
   * コマンドライン引数を解析し、構造化されたパラメータオブジェクトを返す
   * @param args コマンドライン引数の配列
   * @returns パース結果
   */
  parse(args: string[]): ParamsResult {
    try {
      // オプションとその値を除外して、実際のパラメータのみを取得
      const nonOptionArgs = args.filter((arg, index) => {
        if (arg.startsWith("-")) return false;
        const prevArg = args[index - 1];
        if (prevArg && prevArg.startsWith("-")) return false;
        return true;
      });
      
      // オプションを解析
      const options = this.parseOptions(args);
      
      switch (nonOptionArgs.length) {
        case 0:
          return this.parseNoParams(args);
        case 1:
          return this.parseSingleParam(args);
        case 2:
          return this.parseDoubleParams(args);
        default:
          return this.createErrorResult("Too many arguments. Maximum 2 arguments are allowed.");
      }
    } catch (error) {
      return this.createErrorResult(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }

  /**
   * エラー結果を作成
   */
  private createErrorResult(message: string): NoParamsResult {
    return {
      type: "no-params",
      help: false,
      version: false,
      error: message
    };
  }

  /**
   * オプションのみのパラメータを解析
   */
  private parseNoParams(args: string[]): NoParamsResult {
    const result: NoParamsResult = {
      type: "no-params",
      help: false,
      version: false
    };

    for (const arg of args) {
      if (arg === "--help" || arg === "-h") result.help = true;
      if (arg === "--version" || arg === "-v") result.version = true;
    }

    return result;
  }

  /**
   * 単一パラメータを解析
   */
  private parseSingleParam(args: string[]): SingleParamResult | NoParamsResult {
    const command = args.find(arg => !arg.startsWith("-"));
    if (!command || !this.validSingleCommands.has(command)) {
      return this.createErrorResult(`Invalid command: ${command}`);
    }

    return {
      type: "single",
      command: "init"
    };
  }

  /**
   * 2つのパラメータとオプションを解析
   */
  private parseDoubleParams(args: string[]): DoubleParamsResult | NoParamsResult {
    const [demonstrativeType, layerType] = args.filter((arg, index) => {
      if (arg.startsWith("-")) return false;
      const prevArg = args[index - 1];
      if (prevArg && prevArg.startsWith("-")) return false;
      return true;
    });

    if (!this.demonstrativeTypes.has(demonstrativeType)) {
      return this.createErrorResult(`Invalid demonstrative type: ${demonstrativeType}`);
    }

    const normalizedLayerType = this.normalizeLayerType(layerType.toLowerCase());
    if (!normalizedLayerType) {
      return this.createErrorResult(`Invalid layer type: ${layerType}`);
    }

    return {
      type: "double",
      demonstrativeType: demonstrativeType as DemonstrativeType,
      layerType: normalizedLayerType,
      options: this.parseOptions(args)
    };
  }

  /**
   * オプションを解析
   */
  private parseOptions(args: string[]) {
    const options: Record<string, string> = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case "--from":
        case "-f":
          if (nextArg && !nextArg.startsWith("-")) {
            options.fromFile = nextArg;
            i++;
          }
          break;
        case "--destination":
        case "-o":
          if (nextArg && !nextArg.startsWith("-")) {
            options.destinationFile = nextArg;
            i++;
          }
          break;
        case "--input":
        case "-i":
          if (nextArg && !nextArg.startsWith("-")) {
            const normalizedType = this.normalizeLayerType(nextArg.toLowerCase());
            if (normalizedType) {
              options.fromLayerType = normalizedType;
            }
            i++;
          }
          break;
      }
    }

    // 定義されたプロパティのみを含むオブジェクトを返す
    const result: Record<string, string | LayerType> = {};
    if (options.fromFile) result.fromFile = options.fromFile;
    if (options.destinationFile) result.destinationFile = options.destinationFile;
    if (options.fromLayerType) result.fromLayerType = options.fromLayerType;
    return result;
  }

  /**
   * レイヤータイプのエイリアスを正規化
   */
  private normalizeLayerType(alias: string): LayerType | null {
    const normalized = LayerTypeAliasMap[alias as FromLayerTypeAlias];
    return normalized as LayerType || null;
  }
} 