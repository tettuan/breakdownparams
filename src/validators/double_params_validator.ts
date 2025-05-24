import {
  DoubleParamsResult,
  DemonstrativeType,
  LayerType,
  ParserConfig,
  ErrorCode,
  ErrorCategory,
} from '../types.ts';
import { SecurityValidator } from './security_validator.ts';
import { ErrorFactory } from '../utils/error_factory.ts';

/**
 * DoubleParamsValidator
 * 二重パラメータのバリデーションを担当するクラス
 */
export class DoubleParamsValidator {
  private readonly securityValidator: SecurityValidator;
  private readonly demonstrativeTypes: Set<DemonstrativeType>;
  private readonly layerTypes: Set<LayerType>;
  private readonly config: ParserConfig;
  private readonly layerTypeAliasMap: Record<string, string>;

  constructor(config?: ParserConfig) {
    this.config = config || { isExtendedMode: false };
    this.securityValidator = new SecurityValidator();
    this.demonstrativeTypes = new Set(['to', 'summary', 'defect']);
    this.layerTypes = new Set([
      'project', 'pj', 'prj', 'p',
      'issue', 'story', 'i', 'iss',
      'task', 'todo', 'chore', 'style', 'fix', 'error', 'bug', 't'
    ]);
    this.layerTypeAliasMap = {
      pj: "project", prj: "project", p: "project",
      story: "issue", i: "issue", iss: "issue",
      todo: "task", chore: "task", style: "task", fix: "task", error: "task", bug: "task", t: "task"
    };
  }

  validate(demonstrativeType: string, layerType: string, args: string[]): DoubleParamsResult {
    const result: DoubleParamsResult = {
      type: 'double',
      demonstrativeType: demonstrativeType as DemonstrativeType,
      layerType: layerType as LayerType,
      options: {},
    };

    // 1. Security validation
    const demonstrativeTypeSecurityError = this.securityValidator.validate(demonstrativeType);
    if (demonstrativeTypeSecurityError) {
      result.error = demonstrativeTypeSecurityError;
      return result;
    }

    const layerTypeSecurityError = this.securityValidator.validate(layerType);
    if (layerTypeSecurityError) {
      result.error = layerTypeSecurityError;
      return result;
    }

    // 2. Required field validation
    if (!demonstrativeType) {
      result.error = ErrorFactory.createMissingRequiredArgument('demonstrativeType');
      return result;
    }

    if (!layerType) {
      result.error = ErrorFactory.createMissingRequiredArgument('layerType');
      return result;
    }

    // 3. Layer type normalization
    const normalizedLayerType = this.config.isExtendedMode
      ? layerType
      : this.layerTypeAliasMap[layerType.toLowerCase()] ?? layerType.toLowerCase();

    // 4. Demonstrative type validation
    if (this.config.isExtendedMode && this.config.demonstrativeType?.pattern) {
      const pattern = new RegExp(this.config.demonstrativeType.pattern);
      if (!pattern.test(demonstrativeType)) {
        result.error = {
          message: this.config.demonstrativeType.errorMessage ?? `Invalid demonstrative type: ${demonstrativeType}`,
          code: ErrorCode.INVALID_DEMONSTRATIVE_TYPE,
          category: ErrorCategory.VALIDATION,
          details: {
            provided: demonstrativeType,
            pattern: this.config.demonstrativeType.pattern,
          },
        };
        return result;
      }
    } else if (!this.config.isExtendedMode && !this.demonstrativeTypes.has(demonstrativeType as DemonstrativeType)) {
      result.error = ErrorFactory.createInvalidDemonstrativeType(demonstrativeType);
      return result;
    }

    // 5. Layer type validation
    if (this.config.isExtendedMode && this.config.layerType?.pattern) {
      const pattern = new RegExp(this.config.layerType.pattern);
      if (!pattern.test(normalizedLayerType)) {
        result.error = {
          message: this.config.layerType.errorMessage ?? 'Invalid layer type',
          code: ErrorCode.INVALID_LAYER_TYPE,
          category: ErrorCategory.VALIDATION,
          details: {
            provided: normalizedLayerType,
            pattern: this.config.layerType.pattern,
          },
        };
        return result;
      }
    } else if (!this.config.isExtendedMode && !this.layerTypes.has(normalizedLayerType as LayerType)) {
      result.error = ErrorFactory.createInvalidLayerType(normalizedLayerType);
      return result;
    }

    // 6. Options validation
    for (const arg of args) {
      if (arg.startsWith('--')) {
        if (arg === '--help' || arg === '--version') {
          continue;
        }
        if (arg.startsWith('--uv-')) {
          const securityError = this.securityValidator.validate(arg);
          if (securityError) {
            result.error = ErrorFactory.createInvalidCustomVariable(arg);
            return result;
          }
          continue;
        }
        if (!arg.startsWith('--from') && !arg.startsWith('--destination') && !arg.startsWith('--input') && !arg.startsWith('--adaptation') && !arg.startsWith('--config')) {
          result.error = ErrorFactory.createUnknownOption(arg);
          return result;
        }
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        if (!arg.startsWith('-f') && !arg.startsWith('-o') && !arg.startsWith('-i') && !arg.startsWith('-a') && !arg.startsWith('-c')) {
          result.error = ErrorFactory.createUnknownOption(arg);
          return result;
        }
      }
    }

    // Update result with normalized layer type
    result.layerType = normalizedLayerType as LayerType;
    return result;
  }
} 