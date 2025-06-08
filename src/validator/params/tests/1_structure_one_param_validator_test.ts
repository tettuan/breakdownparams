import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { OneParamValidator } from '../one_param_validator.ts';

Deno.test('test_one_param_validator_structure', () => {
  const validator = new OneParamValidator();
  const result = validator.validate(['init']);
  assertEquals(result.isValid, true, 'One param validator should accept init param');
  assertEquals(result.validatedParams, ['init'], 'One param validator should return correct param');
  assertEquals(result.demonstrativeType, 'init', 'One param validator should set demonstrative type');
}); 