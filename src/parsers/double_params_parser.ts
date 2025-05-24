import {
  DoubleParamsResult,
  ErrorInfo,
  DemonstrativeType,
  LayerType,
  ErrorCode,
  ErrorCategory,
  ParserConfig,
} from '../types.ts';
import { ValidatorFactory } from '../validators/validator_factory.ts';
import { OptionParser } from '../utils/option_parser.ts';
import { DoubleParamsValidator } from '../validators/double_params_validator.ts';

/**
 * DoubleParamsParser
 * 二重パラメータの解析を担当するクラス
 */
export class DoubleParamsParser {
  private readonly validator: DoubleParamsValidator;
  private readonly optionParser: OptionParser;

  constructor(validatorFactory: ValidatorFactory, config?: ParserConfig) {
    this.validator = validatorFactory.createDoubleParamsValidator(config);
    this.optionParser = new OptionParser();
  }

  parse(demonstrativeType: string, layerType: string, args: string[]): DoubleParamsResult {
    // バリデーションを実行
    const validationResult = this.validator.validate(demonstrativeType, layerType, args);
    if (validationResult.error) {
      return validationResult;
    }

    // オプション解析を実行
    const options = this.optionParser.parse(args);
    if ('error' in options) {
      validationResult.error = options.error;
      return validationResult;
    }

    validationResult.options = options;
    return validationResult;
  }
} 