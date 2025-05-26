import { ParamPatternValidator } from './types.ts';
import { ZeroParamValidatorImpl } from './zero_param_validator.ts';
import { OneParamValidatorImpl } from './one_param_validator.ts';
import { TwoParamValidatorImpl } from './two_param_validator.ts';
import { SecurityErrorValidator } from './security_error_validator.ts';

/**
 * Factory for creating parameter pattern validators
 */
export class ValidatorFactory {
  private static instance: ValidatorFactory;
  private validators: Map<string, ParamPatternValidator>;

  private constructor() {
    this.validators = new Map();
  }

  /**
   * Gets the singleton instance of the factory
   * @returns The factory instance
   */
  public static getInstance(): ValidatorFactory {
    if (!ValidatorFactory.instance) {
      ValidatorFactory.instance = new ValidatorFactory();
    }
    return ValidatorFactory.instance;
  }

  /**
   * Creates a zero parameter validator
   * @returns The validator
   */
  public createZeroParamValidator(): ParamPatternValidator {
    const key = 'zero';
    if (!this.validators.has(key)) {
      this.validators.set(key, new ZeroParamValidatorImpl());
    }
    return this.validators.get(key)!;
  }

  /**
   * Creates a one parameter validator
   * @returns The validator
   */
  public createOneParamValidator(): ParamPatternValidator {
    const key = 'one';
    if (!this.validators.has(key)) {
      this.validators.set(key, new OneParamValidatorImpl());
    }
    return this.validators.get(key)!;
  }

  /**
   * Creates a two parameter validator
   * @returns The validator
   */
  public createTwoParamValidator(): ParamPatternValidator {
    const key = 'two';
    if (!this.validators.has(key)) {
      this.validators.set(key, new TwoParamValidatorImpl());
    }
    return this.validators.get(key)!;
  }

  /**
   * Creates a security error validator
   * @returns The validator
   */
  public createSecurityErrorValidator(): SecurityErrorValidator {
    const key = 'security';
    if (!this.validators.has(key)) {
      this.validators.set(key, new SecurityErrorValidator());
    }
    return this.validators.get(key)! as SecurityErrorValidator;
  }
} 