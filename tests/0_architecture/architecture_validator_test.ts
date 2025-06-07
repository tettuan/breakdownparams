import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { BaseValidator } from '../../src/validator/base_validator.ts';
import { SecurityErrorValidator } from '../../src/validator/security_error_validator.ts';
import { OptionsValidator } from '../../src/validator/options_validator.ts';
import { ZeroParamsValidator } from '../../src/validator/zero_params_validator.ts';
import { OneParamValidator } from '../../src/validator/one_param_validator.ts';
import { TwoParamValidator } from '../../src/validator/two_param_validator.ts';
import { ParamSpecificOptionValidator } from '../../src/validator/param_specific_option_validator.ts';
import { OptionRule } from '../../src/result/types.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['uv-project', 'uv-version', 'uv-environment'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
  paramSpecificOptions: {
    zero: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    one: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    two: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
  },
};

Deno.test('test_base_validator_interface', () => {
  assertEquals(
    Object.getOwnPropertyDescriptor(BaseValidator.prototype, 'validate')?.get,
    undefined,
  );
  assertEquals(
    Object.getOwnPropertyDescriptor(BaseValidator.prototype, 'validate')?.set,
    undefined,
  );
  assertEquals(
    Object.getOwnPropertyDescriptor(BaseValidator.prototype, 'validate')?.value,
    undefined,
  );
});

Deno.test('test_security_error_validator_interface', () => {
  const validator = new SecurityErrorValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_options_validator_interface', () => {
  const validator = new OptionsValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_zero_params_validator_interface', () => {
  const validator = new ZeroParamsValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_one_param_validator_interface', () => {
  const validator = new OneParamValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_two_param_validator_interface', () => {
  const validator = new TwoParamValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_param_specific_option_validator_interface', () => {
  const validator = new ParamSpecificOptionValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
  assertEquals(typeof validator.validateForZero, 'function');
  assertEquals(typeof validator.validateForOne, 'function');
  assertEquals(typeof validator.validateForTwo, 'function');
});

Deno.test('test_param_specific_option_validator_zero_params', () => {
  const validator = new ParamSpecificOptionValidator(optionRule);
  const result = validator.validateForZero({ help: undefined });
  assertEquals(result.isValid, true);
});

Deno.test('test_param_specific_option_validator_one_param', () => {
  const validator = new ParamSpecificOptionValidator(optionRule);
  const result = validator.validateForOne({ help: undefined });
  assertEquals(result.isValid, true);
});

Deno.test('test_param_specific_option_validator_two_params', () => {
  const validator = new ParamSpecificOptionValidator(optionRule);
  const result = validator.validateForTwo({ help: undefined });
  assertEquals(result.isValid, true);
});

Deno.test('test_param_specific_option_validator_unknown_option', () => {
  const validator = new ParamSpecificOptionValidator(optionRule);
  const result = validator.validateForZero({ unknown: 'value' });
  assertEquals(result.isValid, false);
  assertEquals(result.error?.category, 'unknown_options');
});

Deno.test('test_param_specific_option_validator_missing_required', () => {
  const validator = new ParamSpecificOptionValidator({
    ...optionRule,
    paramSpecificOptions: {
      ...optionRule.paramSpecificOptions,
      zero: {
        allowedOptions: ['help', 'version', 'required'],
        requiredOptions: ['required'],
      },
    },
  });
  const result = validator.validateForZero({ help: undefined });
  assertEquals(result.isValid, false);
  assertEquals(result.error?.category, 'missing_options');
});
