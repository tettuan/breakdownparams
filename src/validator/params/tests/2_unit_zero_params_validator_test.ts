import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { ZeroParamsValidator } from '../zero_params_validator.ts';

Deno.test('test_zero_params_validator_unit', () => {
  const validator = new ZeroParamsValidator();

  // 正常系テスト
  const validResult = validator.validate([]);
  assertEquals(validResult.isValid, true, 'Empty params should be valid');
  assertEquals(validResult.validatedParams, [], 'Should return empty params');

  // 異常系テスト
  const invalidResult = validator.validate(['test']);
  assertEquals(invalidResult.isValid, false, 'Non-empty params should be invalid');
  assertEquals(invalidResult.errorMessage, 'Expected zero parameters', 'Should return correct error message');
  assertEquals(invalidResult.errorCode, 'INVALID_PARAMS', 'Should return correct error code');
}); 