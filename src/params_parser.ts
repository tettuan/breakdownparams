import {
  ParamsResult,
  NoParamsResult,
  SingleParamResult,
  DoubleParamsResult,
  DemonstrativeType,
  OptionParams,
  LayerTypeAliasMap,
} from "./types.ts";

/**
 * A class to parse and validate command line arguments.
 * 
 * This class provides functionality to parse command line arguments
 * with type safety and validation.
 * 
 * @example
 * ```ts
 * const parser = new ParamsParser();
 * const result = parser.parse(Deno.args);
 * 
 * if (result.type === "no-params") {
 *   console.log(`Help: ${result.help}, Version: ${result.version}`);
 * } else if (result.type === "single") {
 *   console.log(`Command: ${result.command}`);
 * } else if (result.type === "double") {
 *   console.log(`Type: ${result.demonstrativeType}, Layer: ${result.layerType}`);
 * }
 * ```
 */
export class ParamsParser {
  private readonly demonstrativeTypes = new Set<DemonstrativeType>(["to", "summary", "defect"]);
  private readonly validSingleCommands = new Set<string>(["init"]);

  /**
   * Parse command line arguments.
   * 
   * This method parses the command line arguments and returns a result
   * indicating whether the parsing was successful or not.
   * 
   * @param args - The command line arguments to parse
   * @returns A result object containing either the parsed data or an error message
   */
  parse(args: string[]): ParamsResult {
    try {
      const nonOptionArgs: string[] = [];
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg.startsWith("-")) {
          nonOptionArgs.push(arg);
        } else {
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith("-")) {
            i++;
          }
        }
      }
      
      if (nonOptionArgs.length === 0) {
        return this.parseNoParams(args);
      } else if (nonOptionArgs.length === 1) {
        return this.parseSingleParam(nonOptionArgs[0], args);
      } else if (nonOptionArgs.length === 2) {
        return this.parseDoubleParams(nonOptionArgs[0], nonOptionArgs[1], args);
      } else {
        return {
          type: "no-params",
          error: "Too many arguments. Maximum 2 arguments are allowed."
        };
      }
    } catch (error) {
      return {
        type: "no-params",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Parse arguments when no parameters are expected.
   * 
   * @param args - The command line arguments
   * @returns A result object containing help and version flags
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
   * Parse arguments when a single parameter is expected.
   * 
   * @param command - The command parameter
   * @param args - The command line arguments
   * @returns A result object containing the parsed command
   */
  private parseSingleParam(command: string, args: string[]): SingleParamResult | NoParamsResult {
    if (!this.validSingleCommands.has(command)) {
      return {
        type: "no-params",
        error: `Invalid command: ${command}`,
        help: false,
        version: false
      };
    }

    return {
      type: "single",
      command: "init",
      options: this.parseOptions(args)
    };
  }

  /**
   * Parse arguments when two parameters are expected.
   * 
   * @param demonstrativeType - The demonstrative type parameter
   * @param layerType - The layer type parameter
   * @param args - The command line arguments
   * @returns A result object containing the parsed parameters
   */
  private parseDoubleParams(
    demonstrativeType: string,
    layerType: string,
    args: string[]
  ): DoubleParamsResult {
    const normalizedDemonstrativeType = demonstrativeType.toLowerCase();
    if (!this.demonstrativeTypes.has(normalizedDemonstrativeType as DemonstrativeType)) {
      return {
        type: "double",
        error: `Invalid demonstrative type: ${demonstrativeType}. Must be one of: to, summary, defect`
      };
    }

    // 大文字小文字を区別せずにエイリアスを検証
    const normalizedLayerType = layerType.toLowerCase();
    const mappedLayerType = LayerTypeAliasMap[normalizedLayerType as keyof typeof LayerTypeAliasMap];

    if (!mappedLayerType) {
      return {
        type: "double",
        error: `Invalid layer type: ${layerType}`
      };
    }

    const options = this.parseOptions(args);

    return {
      type: "double",
      demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
      layerType: mappedLayerType,
      options
    };
  }

  /**
   * Parse command line options.
   * 
   * This method extracts and parses command line options from the arguments.
   * 
   * @param args - The command line arguments to parse
   * @returns An object containing the parsed options
   */
  private parseOptions(args: string[]): OptionParams {
    const options: OptionParams = {};
    
    // ロングフォームを先に処理
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];
      
      if (!nextArg || nextArg.startsWith("-")) continue;
      
      if (arg === "--from" || arg === "--destination" || arg === "--input") {
        if (arg === "--from") options.fromFile = nextArg;
        if (arg === "--destination") options.destinationFile = nextArg;
        if (arg === "--input") {
          const value = nextArg.toLowerCase();
          if (value in LayerTypeAliasMap) {
            options.fromLayerType = LayerTypeAliasMap[value as keyof typeof LayerTypeAliasMap];
          }
        }
        i++;
      }
    }
    
    // ショートハンドは、ロングフォームが未設定の場合のみ処理
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];
      
      if (!nextArg || nextArg.startsWith("-")) continue;
      
      if (arg === "-f" && !options.fromFile) {
        options.fromFile = nextArg;
        i++;
      } else if (arg === "-o" && !options.destinationFile) {
        options.destinationFile = nextArg;
        i++;
      } else if (arg === "-i" && !options.fromLayerType) {
        const value = nextArg.toLowerCase();
        if (value in LayerTypeAliasMap) {
          options.fromLayerType = LayerTypeAliasMap[value as keyof typeof LayerTypeAliasMap];
        }
        i++;
      }
    }

    return options;
  }
} 