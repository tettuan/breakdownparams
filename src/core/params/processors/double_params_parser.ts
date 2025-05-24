import {
  DoubleParamsResult,
  ParseResult,
  ErrorResult,
  ParserConfig,
  DemonstrativeType,
  LayerType,
  ErrorInfo
} from '../definitions/types.ts';
import { ValidatorFactory } from '../../../validators/validator_factory.ts';
import { DoubleParamsValidator } from '../../../validators/double_params_validator.ts';
import { OptionParser } from '../../options/processors/option_parser.ts';

/**
 * A class to parse and validate double parameters for the breakdown structure system.
 *
 * This class handles the parsing and validation of commands that require two parameters:
 * 1. A demonstrative type (e.g., 'to', 'summary', 'defect')
 * 2. A layer type (e.g., 'project', 'issue', 'task')
 *
 * @example
 * ```ts
 * const parser = new DoubleParamsParser(validatorFactory);
 * const result = parser.parse('to', 'project', ['--from=input.txt']);
 *
 * if (result.error) {
 *   // Handle error
 * } else {
 *   const { demonstrativeType, layerType, options } = result;
 *   // Process the parameters
 * }
 * ```
 *
 * @since 1.0.0
 * @module
 */
export class DoubleParamsParser {
  private readonly validator: DoubleParamsValidator;
  private readonly optionParser: OptionParser;

  constructor(
    private readonly validatorFactory: ValidatorFactory,
    private readonly config?: ParserConfig
  ) {
    this.validator = this.validatorFactory.createDoubleParamsValidator();
    this.optionParser = new OptionParser();
  }

  public parse(
    demonstrativeType: string,
    layerType: string,
    args: string[]
  ): ParseResult<DoubleParamsResult> {
    const validationResult = this.validator.validate(demonstrativeType, layerType, args);
    if (validationResult) {
      return {
        type: 'double',
        demonstrativeType: 'to',
        layerType: 'project',
        options: {},
        error: validationResult as unknown as ErrorInfo & ErrorResult
      };
    }

    const options = this.optionParser.parse(args);
    if ('error' in options) {
      return {
        type: 'double',
        demonstrativeType: demonstrativeType as DemonstrativeType,
        layerType: layerType as LayerType,
        options: {},
        error: options.error as ErrorInfo & ErrorResult
      };
    }

    return {
      type: 'double',
      demonstrativeType: demonstrativeType as DemonstrativeType,
      layerType: layerType as LayerType,
      options
    };
  }
} 