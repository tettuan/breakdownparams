import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { TwoParamsValidator } from '../two_params_validator.ts';
import { BaseValidator } from '../base_validator.ts';

Deno.test('test_two_params_validator_architecture', () => {
  const validator = new TwoParamsValidator();
  assertEquals(validator instanceof BaseValidator, true, 'Should be instance of BaseValidator');
  assertEquals(typeof validator.validate, 'function', 'Should have validate method');
});
