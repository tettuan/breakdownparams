import { RequiredFieldValidator } from './required_field_validator.ts';
import { CustomVariableValidator } from './custom_variable_validator.ts';
import { ZeroParamsValidator } from './zero_params_validator.ts';
import { OneParamValidator } from './one_param_validator.ts';
import { TwoParamValidator } from './two_params_validator.ts';
import { InitialBranchValidator } from './initial_branch_validator.ts';
import { SecurityErrorValidator } from '../core/errors/validators/security_error_validator.ts';

/**
 * Factory for creating validators
 *
 * This factory is responsible for creating and managing validator instances.
 * It provides methods to create different types of validators based on the validation needs.
 *
 * @since 1.0.0
 */
export class ValidatorFactory {
  private static instance: ValidatorFactory;
  private validators: Map<string, unknown>;

  private constructor() {
    this.validators = new Map();
  }

  /**
   * Gets the singleton instance of the ValidatorFactory
   *
   * @returns The ValidatorFactory instance
   */
  public static getInstance(): ValidatorFactory {
    if (!ValidatorFactory.instance) {
      ValidatorFactory.instance = new ValidatorFactory();
    }
    return ValidatorFactory.instance;
  }

  /**
   * Creates a required field validator
   *
   * @param fieldName - The name of the field to validate
   * @returns A RequiredFieldValidator instance
   */
  public createRequiredFieldValidator(fieldName: string): RequiredFieldValidator {
    const key = `required_${fieldName}`;
    if (!this.validators.has(key)) {
      this.validators.set(key, new RequiredFieldValidator(fieldName));
    }
    return this.validators.get(key) as RequiredFieldValidator;
  }

  /**
   * Creates a custom variable validator
   *
   * @returns A CustomVariableValidator instance
   */
  public createCustomVariableValidator(): CustomVariableValidator {
    const key = 'custom_variable';
    if (!this.validators.has(key)) {
      this.validators.set(key, new CustomVariableValidator());
    }
    return this.validators.get(key) as CustomVariableValidator;
  }

  /**
   * Creates a security validator
   *
   * @returns A SecurityValidator instance
   */
  public createSecurityValidator(): SecurityErrorValidator {
    const key = 'security';
    if (!this.validators.has(key)) {
      this.validators.set(key, new SecurityErrorValidator());
    }
    return this.validators.get(key) as SecurityErrorValidator;
  }

  public createZeroParamsValidator(): ZeroParamsValidator {
    const key = 'zero';
    if (!this.validators.has(key)) {
      this.validators.set(key, new ZeroParamsValidator());
    }
    return this.validators.get(key) as ZeroParamsValidator;
  }

  public createOneParamValidator(): OneParamValidator {
    const key = 'one';
    if (!this.validators.has(key)) {
      this.validators.set(key, new OneParamValidator());
    }
    return this.validators.get(key) as OneParamValidator;
  }

  public createTwoParamsValidator(): TwoParamValidator {
    const key = 'two';
    if (!this.validators.has(key)) {
      this.validators.set(key, new TwoParamValidator());
    }
    return this.validators.get(key) as TwoParamValidator;
  }

  public createInitialBranchValidator(): InitialBranchValidator {
    const key = 'initial_branch';
    if (!this.validators.has(key)) {
      this.validators.set(key, new InitialBranchValidator());
    }
    return this.validators.get(key) as InitialBranchValidator;
  }

  public getValidator<T>(type: string): T {
    // Try to get existing validator
    let validator = this.validators.get(type);

    // If not found, create it based on type
    if (!validator) {
      switch (type) {
        case 'security':
          validator = this.createSecurityValidator();
          break;
        case 'one':
          validator = this.createOneParamValidator();
          break;
        case 'two':
          validator = this.createTwoParamsValidator();
          break;
        case 'zero':
          validator = this.createZeroParamsValidator();
          break;
        case 'custom_variable':
          validator = this.createCustomVariableValidator();
          break;
        case 'initial_branch':
          validator = this.createInitialBranchValidator();
          break;
        default:
          throw new Error(`Validator not found: ${type}`);
      }
    }

    return validator as T;
  }
}
