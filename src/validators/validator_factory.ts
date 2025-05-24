import { Validator } from './validator.ts';
import { RequiredFieldValidator } from './required_field_validator.ts';
import { CustomVariableValidator } from './custom_variable_validator.ts';
import { SecurityValidator } from './security_validator.ts';
import { NoParamsValidator } from './no_params_validator.ts';
import { SingleParamValidator } from './single_param_validator.ts';
import { DoubleParamsValidator } from './double_params_validator.ts';
import { ParserConfig } from '../types.ts';

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
  private validators: Map<string, Validator>;
  private readonly securityValidator: SecurityValidator;
  private readonly requiredFieldValidator: RequiredFieldValidator;
  private readonly customVariableValidator: CustomVariableValidator;
  private readonly noParamsValidator: NoParamsValidator;
  private readonly singleParamValidator: SingleParamValidator;
  private readonly doubleParamsValidator: DoubleParamsValidator;

  private constructor() {
    this.validators = new Map();
    this.securityValidator = new SecurityValidator();
    this.requiredFieldValidator = new RequiredFieldValidator('default');
    this.customVariableValidator = new CustomVariableValidator();
    this.noParamsValidator = new NoParamsValidator();
    this.singleParamValidator = new SingleParamValidator();
    this.doubleParamsValidator = new DoubleParamsValidator();
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
  public createSecurityValidator(): SecurityValidator {
    const key = 'security';
    if (!this.validators.has(key)) {
      this.validators.set(key, new SecurityValidator());
    }
    return this.validators.get(key) as SecurityValidator;
  }

  public createNoParamsValidator(): NoParamsValidator {
    return this.noParamsValidator;
  }

  public createSingleParamValidator(): SingleParamValidator {
    return this.singleParamValidator;
  }

  public createDoubleParamsValidator(config?: ParserConfig): DoubleParamsValidator {
    return new DoubleParamsValidator(config);
  }
} 