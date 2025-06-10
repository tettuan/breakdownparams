import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { SecurityValidator } from '../security_validator.ts';

Deno.test('test_security_validator_structure', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['safe_param']);
  assertEquals(result.isValid, true, 'Security validator should accept safe params');
  assertEquals(
    result.validatedParams,
    ['safe_param'],
    'Security validator should return correct params',
  );
});
