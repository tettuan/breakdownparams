import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { SecurityValidator } from '../security_validator.ts';
import { BaseValidator } from '../params/base_validator.ts';

Deno.test('test_security_validator_architecture', () => {
  const validator = new SecurityValidator();
  assertEquals(validator instanceof BaseValidator, true, 'Should be instance of BaseValidator');
  assertEquals(typeof validator.validate, 'function', 'Should have validate method');
}); 