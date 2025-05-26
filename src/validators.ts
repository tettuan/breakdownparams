/**
 * Validation modules for parameter parsing
 * 
 * This module provides validator classes for different parameter scenarios:
 * - ZeroParamsValidator: validates no-parameter scenarios  
 * - OneParamsValidator: validates single-parameter scenarios
 * - TwoParamsValidator: validates double-parameter scenarios
 */

import {
  DemonstrativeType,
  ErrorInfo,
  LayerType,
  LayerTypeAliasMap,
  NoParamsResult,
  OptionParams,
  ParamsResult,
  SingleParamResult,
  DoubleParamsResult,
  ParserConfig,
} from './types.ts';

/**
 * Base interface for all validators
 */
export interface Validator {
  validate(args: string[]): ParamsResult;
}

/**
 * Validator for zero parameters (no positional arguments)
 */
export class ZeroParamsValidator implements Validator {
  private config: ParserConfig;

  constructor(config: ParserConfig) {
    this.config = config;
  }

  validate(args: string[]): NoParamsResult {
    const result: NoParamsResult = {
      type: 'no-params',
      help: false,
      version: false,
    };

    // Check for help and version flags
    for (const arg of args) {
      if (arg === '--help' || arg === '-h') result.help = true;
      if (arg === '--version' || arg === '-v') result.version = true;
    }

    return result;
  }
}

/**
 * Validator for one parameter (single positional argument)
 */
export class OneParamsValidator implements Validator {
  private config: ParserConfig;
  private readonly validSingleCommands = new Set<string>(['init']);

  constructor(config: ParserConfig) {
    this.config = config;
  }

  validate(args: string[], command: string): SingleParamResult {
    if (!this.validSingleCommands.has(command)) {
      return {
        type: 'single',
        command: 'init',
        options: {},
        error: {
          message: `Invalid command: ${command}. Must be one of: ${
            Array.from(this.validSingleCommands).join(', ')
          }`,
          code: 'INVALID_COMMAND',
          category: 'VALIDATION',
          details: { provided: command, validCommands: Array.from(this.validSingleCommands) },
        },
      };
    }

    return {
      type: 'single',
      command: 'init',
      options: {},
    };
  }
}

/**
 * Validator for two parameters (double positional arguments)
 */
export class TwoParamsValidator implements Validator {
  private config: ParserConfig;
  private readonly demonstrativeTypes = new Set<DemonstrativeType>([
    'to',
    'summary', 
    'defect',
  ]);
  private readonly layerTypes = new Set<LayerType>(['project', 'issue', 'task']);
  private readonly layerTypeAliases = new Set<string>(Object.keys(LayerTypeAliasMap));

  constructor(config: ParserConfig) {
    this.config = config;
  }

  validate(
    args: string[],
    demonstrativeType: string,
    layerType: string,
  ): DoubleParamsResult {
    const normalizedDemonstrativeType = demonstrativeType.toLowerCase();
    let normalizedLayerType = layerType.toLowerCase();

    // Convert layer type aliases to canonical form
    if (this.layerTypeAliases.has(normalizedLayerType)) {
      // @ts-ignore: LayerTypeAliasMapの型定義は正しいが、TypeScriptが動的なプロパティアクセスを検出できない
      normalizedLayerType = LayerTypeAliasMap[normalizedLayerType];
    }

    // Validate forbidden characters
    const forbiddenChars = [
      ';', '|', '&', '`', '$', '>', '<', '(', ')', '{', '}', '[', ']',
      '\\', '/', '*', '?', '+', '^', '~', '!', '@', '#', '%', '=', ':',
      '"', "'", ',',
    ];

    for (const c of forbiddenChars) {
      if (demonstrativeType.includes(c) || layerType.includes(c)) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: `Security error: character '${c}' is not allowed in parameters`,
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: {
              forbiddenChar: c,
              location: demonstrativeType.includes(c) ? 'demonstrativeType' : 'layerType',
            },
          },
        };
      }
    }

    // Validate demonstrative type
    if (this.config.isExtendedMode && this.config.demonstrativeType) {
      const patternStr = this.config.demonstrativeType.pattern;
      if (!patternStr || patternStr.trim() === '') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid configuration: pattern is required in extended mode',
            code: 'INVALID_CONFIG',
            category: 'CONFIGURATION',
            details: { missingField: 'pattern' },
          },
        };
      }

      if (patternStr.trim() === '.*') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Security error: pattern "*" is not allowed',
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { invalidPattern: patternStr },
          },
        };
      }

      let pattern: RegExp;
      try {
        pattern = new RegExp(patternStr);
      } catch (_error) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid demonstrative type pattern configuration',
            code: 'INVALID_PATTERN',
            category: 'CONFIGURATION',
            details: { pattern: patternStr },
          },
        };
      }

      if (!pattern.test(demonstrativeType)) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: this.config.demonstrativeType.errorMessage ||
              `Invalid demonstrative type: ${demonstrativeType}`,
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { provided: demonstrativeType, pattern: patternStr },
          },
        };
      }
    } else if (!this.demonstrativeTypes.has(normalizedDemonstrativeType as DemonstrativeType)) {
      return {
        type: 'double',
        demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
        layerType: normalizedLayerType as LayerType,
        options: {},
        error: {
          message: `Invalid demonstrative type: ${demonstrativeType}. Must be one of: ${
            Array.from(this.demonstrativeTypes).join(', ')
          }`,
          code: 'VALIDATION_ERROR',
          category: 'VALIDATION',
          details: { provided: demonstrativeType, validTypes: Array.from(this.demonstrativeTypes) },
        },
      };
    }

    // Validate layer type
    if (this.config.isExtendedMode && this.config.layerType) {
      const patternStr = this.config.layerType.pattern;
      if (!patternStr || patternStr.trim() === '') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid configuration: pattern is required in extended mode',
            code: 'INVALID_CONFIG',
            category: 'CONFIGURATION',
            details: { missingField: 'pattern' },
          },
        };
      }

      if (patternStr.trim() === '.*') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Security error: pattern "*" is not allowed',
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { invalidPattern: patternStr },
          },
        };
      }

      let pattern: RegExp;
      try {
        pattern = new RegExp(patternStr);
      } catch (_error) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid layer type pattern configuration',
            code: 'INVALID_PATTERN',
            category: 'CONFIGURATION',
            details: { pattern: patternStr },
          },
        };
      }

      if (!pattern.test(layerType)) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: this.config.layerType.errorMessage || `Invalid layer type: ${layerType}`,
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { provided: layerType, pattern: patternStr },
          },
        };
      }
    } else if (!this.layerTypes.has(normalizedLayerType as LayerType)) {
      return {
        type: 'double',
        demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
        layerType: normalizedLayerType as LayerType,
        options: {},
        error: {
          message: `Invalid layer type: ${layerType}. Must be one of: ${
            Array.from(this.layerTypes).join(', ')
          }`,
          code: 'VALIDATION_ERROR',
          category: 'VALIDATION',
          details: { provided: layerType, validTypes: Array.from(this.layerTypes) },
        },
      };
    }

    return {
      type: 'double',
      demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
      layerType: normalizedLayerType as LayerType,
      options: {},
    };
  }
}