import { SingleParamResult, ErrorInfo, ErrorCode, ErrorCategory } from '../types.ts';
import { ValidatorFactory } from '../validators/validator_factory.ts';
import { OptionParser } from '../utils/option_parser.ts';
import { SingleParamValidator } from '../validators/single_param_validator.ts';

/**
 * SingleParamParser
 * 単一パラメータ（init等）の解析を担当するクラス
 */
export class SingleParamParser {
  private readonly validator: SingleParamValidator;
  private readonly optionParser: OptionParser;

  constructor(validatorFactory: ValidatorFactory) {
    this.validator = validatorFactory.createSingleParamValidator();
    this.optionParser = new OptionParser();
  }

  parse(command: string, args: string[]): SingleParamResult {
    // バリデーションを実行
    const validationResult = this.validator.validate(command, args);
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

    // Remove configFile for single param commands
    if ('configFile' in options) {
      delete options.configFile;
    }

    validationResult.options = options;
    return validationResult;
  }
} 