export enum OptionType {
  VALUE = "VALUE",
  FLAG = "FLAG",
  CUSTOM_VARIABLE = "CUSTOM_VARIABLE"
}

export type OptionValue = string | boolean | undefined;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface Option {
  readonly name: string;
  readonly aliases: string[];
  readonly type: OptionType;
  readonly isRequired: boolean;
  readonly description: string;

  validate(value: string | undefined): ValidationResult;
  parse(value: string | undefined): OptionValue;
}

export interface OptionRegistry {
  register(option: Option): void;
  get(name: string): Option | undefined;
  validateCustomVariable(name: string): boolean;
  getAll(): Option[];
} 