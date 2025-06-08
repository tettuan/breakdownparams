import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { BaseValidator } from '../../src/validator/base_validator.ts';
import { SecurityErrorValidator } from '../../src/validator/security_error_validator.ts';
import { OptionsValidator } from '../../src/validator/options_validator.ts';
import { ZeroParamsValidator } from '../../src/validator/zero_params_validator.ts';
import { OneParamValidator } from '../../src/validator/one_param_validator.ts';
import { TwoParamsValidator } from '../../src/validator/two_params_validator.ts';
import { OptionRule } from "../../src/types/option_rule.ts"';

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

Deno.test('test_two_params_validator_interface', () => {
  const validator = new TwoParamsValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});
