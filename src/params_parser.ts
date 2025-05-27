import { ParamPatternResult, ParseResult } from './core/params/types.ts';
import { ValidatorFactory } from './validators/validator_factory.ts';
import { InitialBranchValidator } from './validators/initial_branch_validator.ts';

/**
 * Parser for command line parameters
 */
export class ParamsParser {
  private readonly validatorFactory: ValidatorFactory;
  private readonly initialBranchValidator: InitialBranchValidator;

  constructor() {
    this.validatorFactory = ValidatorFactory.getInstance();
    this.initialBranchValidator = this.validatorFactory.createInitialBranchValidator();
  }

  /**
   * Parses command line arguments
   * @param args The arguments to parse
   * @returns The parsing result
   */
  parse(args: string[]): ParseResult<ParamPatternResult> {
    return this.initialBranchValidator.validate(args);
  }
}
