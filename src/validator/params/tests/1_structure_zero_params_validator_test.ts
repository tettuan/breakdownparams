import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { ZeroParamsValidator } from '../zero_params_validator.ts';

Deno.test('test_zero_params_validator_structure', () => {
  const validator = new ZeroParamsValidator();
  const result = validator.validate([]);
  assertEquals(result.isValid, true, 'Zero params validator should accept empty params');
  assertEquals(result.validatedParams, [], 'Zero params validator should return empty params');
});
