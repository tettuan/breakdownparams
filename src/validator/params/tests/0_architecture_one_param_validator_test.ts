import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { OneParamValidator } from '../one_param_validator.ts';
import { BaseValidator } from '../base_validator.ts';

Deno.test('test_one_param_validator_architecture', () => {
  const validator = new OneParamValidator();
  assertEquals(validator instanceof BaseValidator, true, 'Should be instance of BaseValidator');
  assertEquals(typeof validator.validate, 'function', 'Should have validate method');
}); 