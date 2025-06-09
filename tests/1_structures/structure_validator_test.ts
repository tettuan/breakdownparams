import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { BaseValidator } from "../../src/validator/params/base_validator.ts";
import { SecurityErrorValidator } from '../../src/validator/security_error_validator.ts';
import { OptionsValidator } from '../../src/validator/options_validator.ts';
import { ZeroParamsValidator } from "../../src/validator/params/zero_params_validator.ts";
import { OneParamValidator } from "../../src/validator/params/one_param_validator.ts";
import { TwoParamsValidator } from "../../src/validator/params/two_params_validator.ts";
import { OptionRule } from "../../src/types/option_rule.ts";

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--demonstrative-type', '--layer-type'],
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

Deno.test('test_security_error_validator_structure', () => {
  const validator = new SecurityErrorValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_options_validator_structure', () => {
  const validator = new OptionsValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_zero_params_validator_structure', () => {
  const validator = new ZeroParamsValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_one_param_validator_structure', () => {
  const validator = new OneParamValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_two_param_validator_structure', () => {
  const validator = new TwoParamsValidator(optionRule);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});
