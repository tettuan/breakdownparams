import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { TwoParamsValidator } from '../../../src/validator/params/two_params_validator.ts';

Deno.test('test_two_param_validator_implementation', () => {
  const validator = new TwoParamsValidator();

  // 2つの引数のテスト
  const twoParams = ['to', 'project'];
  const twoParamsResult = validator.validate(twoParams);
  assertEquals(twoParamsResult.isValid, true, 'Two parameters should be valid');
  assertEquals(twoParamsResult.validatedParams, ['to', 'project'], 'Params should match');

  // 無効な引数のテスト
  const invalidParams = ['invalid'];
  const invalidResult = validator.validate(invalidParams);
  assertEquals(invalidResult.isValid, false, 'Invalid parameters should fail validation');
  assertEquals(
    invalidResult.validatedParams,
    invalidParams,
    'Params should contain invalid input for tracking',
  );
  assertEquals(invalidResult.errorCode, 'INVALID_PARAMS', 'Error code should match');
});
