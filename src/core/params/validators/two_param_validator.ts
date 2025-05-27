import { ParamPatternResult, ParseResult, TwoParamResult } from '../types.ts';
import { TwoParamValidator } from './types.ts';
import { BaseValidator } from './base_validator.ts';
import { ErrorInfo } from '../../errors/types.ts';
import { ValidatorFactory } from './validator_factory.ts';
import { SecurityErrorValidator } from './types.ts';

/**
 * Validator for two parameters case
 */
export class TwoParamValidatorImpl extends BaseValidator implements TwoParamValidator {
  private readonly demonstrativeTypes: Set<string>;
  private readonly layerTypes: Set<string>;
  private readonly layerTypeAliases: Map<string, string>;
  private readonly validCommands: Set<string>;
  private readonly securityValidator: SecurityErrorValidator;

  constructor() {
    super();
    this.demonstrativeTypes = new Set(['to', 'summary', 'defect']);
    this.layerTypes = new Set(['project', 'issue', 'task']);
    this.layerTypeAliases = new Map([
      ['p', 'project'],
      ['i', 'issue'],
      ['t', 'task'],
    ]);
    this.validCommands = new Set(['to', 'summary', 'defect']);
    this.securityValidator = ValidatorFactory.getInstance().createSecurityErrorValidator();
  }

  /**
   * Validates two parameters
   * @param args The arguments to validate
   * @returns The validation result
   */
  validateTwoParams(args: string[]): ParseResult<ParamPatternResult> {
    const demonstrativeType = args[0];
    const layerType = args[1];
    const options = this.parseOptions(args.slice(2));

    if ('code' in options) {
      return this.createErrorResult(options as ErrorInfo);
    }

    const result: TwoParamResult = {
      type: 'two',
      demonstrativeType,
      layerType,
      options,
    };

    return this.createSuccessResult(result);
  }

  /**
   * Validates the parameter pattern
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ParamPatternResult> {
    return this.validateTwoParams(args);
  }

  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  canHandle(args: string[]): boolean {
    // This validator can handle double non-option arguments
    const nonOptionArgs = args.filter((arg) => !arg.startsWith('-'));
    return nonOptionArgs.length === 2;
  }

  /**
   * Parses options from command arguments
   * @param args The arguments to parse
   * @returns The parsed options or an error
   */
  protected override parseOptions(args: string[]): Record<string, string> | ErrorInfo {
    const options: Record<string, string> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (!arg.startsWith('-')) {
        continue;
      }

      const option = arg.startsWith('--') ? arg.slice(2) : arg.slice(1);
      const [key, value] = option.split('=');

      // Map short options to long options
      const optionMap: Record<string, string> = {
        'f': 'from',
        'o': 'destination',
        'i': 'input',
        'a': 'adaptation',
      };

      const longKey = optionMap[key] || key;

      // Map option keys to property names
      const propertyMap: Record<string, string> = {
        'from': 'fromFile',
        'destination': 'destinationFile',
        'input': 'fromLayerType',
        'adaptation': 'adaptationType',
      };

      const propertyKey = propertyMap[longKey] || longKey;
      options[propertyKey] = value;
    }

    return options;
  }
}
