import { NoParamsResult, ErrorInfo, OptionParams } from '../types.ts';
import { OptionParser } from '../utils/option_parser.ts';
import { ValidatorFactory } from '../validators/validator_factory.ts';
import { NoParamsValidator } from '../validators/no_params_validator.ts';

/**
 * NoParamsParser
 * パラメータなしの場合の解析を担当するクラス
 */
export class NoParamsParser {
  private readonly validator: NoParamsValidator;
  private readonly optionParser: OptionParser;

  constructor(validatorFactory: ValidatorFactory) {
    this.validator = validatorFactory.createNoParamsValidator();
    this.optionParser = new OptionParser();
  }

  parse(args: string[]): NoParamsResult {
    // バリデーションを実行
    const validationResult = this.validator.validate(args);
    if (validationResult.error) {
      return validationResult;
    }

    // オプション解析を実行
    const options = this.optionParser.parse(args);
    if ('error' in options) {
      validationResult.error = options.error;
      return validationResult;
    }

    if ('customVariables' in options) {
      delete options.customVariables;
    }

    return validationResult;
  }
} 