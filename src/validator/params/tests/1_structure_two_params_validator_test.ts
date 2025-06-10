import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { TwoParamsValidator } from '../two_params_validator.ts';

Deno.test('test_two_params_validator_structure', () => {
  const validator = new TwoParamsValidator();
  const result = validator.validate(['to', 'project']);
  assertEquals(result.isValid, true, 'Two params validator should accept valid params');
  assertEquals(
    result.validatedParams,
    ['to', 'project'],
    'Two params validator should return correct params',
  );
  assertEquals(
    result.demonstrativeType,
    'to',
    'Two params validator should set demonstrative type',
  );
  assertEquals(result.layerType, 'project', 'Two params validator should set layer type');
});
