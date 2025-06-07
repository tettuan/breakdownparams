import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { SecurityErrorValidator } from '../../src/validator/security_error_validator.ts';
import { OptionsValidator } from '../../src/validator/options_validator.ts';
import { ZeroParamsValidator } from '../../src/validator/zero_params_validator.ts';
import { OneParamValidator } from '../../src/validator/one_param_validator.ts';
import { TwoParamValidator } from '../../src/validator/two_param_validator.ts';
import { DEFAULT_OPTION_RULE } from '../../src/parser/params_parser.ts';

Deno.test('test_security_error_validator_structure', () => {
  const validator = new SecurityErrorValidator(DEFAULT_OPTION_RULE);
  assertEquals(typeof validator.validate, 'function');
  assertEquals(validator instanceof SecurityErrorValidator, true);
});

Deno.test('test_options_validator_structure', () => {
  const validator = new OptionsValidator(DEFAULT_OPTION_RULE);
  assertEquals(typeof validator.validate, 'function');
  assertEquals(validator instanceof OptionsValidator, true);
});

Deno.test('test_zero_params_validator_structure', () => {
  const validator = new ZeroParamsValidator(DEFAULT_OPTION_RULE);
  assertEquals(typeof validator.validate, 'function');
  assertEquals(validator instanceof ZeroParamsValidator, true);
});

Deno.test('test_one_param_validator_structure', () => {
  const validator = new OneParamValidator(DEFAULT_OPTION_RULE);
  assertEquals(typeof validator.validate, 'function');
  assertEquals(validator instanceof OneParamValidator, true);
});

Deno.test('test_two_param_validator_structure', () => {
  const validator = new TwoParamValidator(DEFAULT_OPTION_RULE);
  assertEquals(typeof validator.validate, 'function');
  assertEquals(validator instanceof TwoParamValidator, true);
});
