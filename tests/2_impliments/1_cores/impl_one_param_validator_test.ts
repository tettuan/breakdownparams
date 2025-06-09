import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OneParamValidator } from '../../../src/validator/params/one_param_validator.ts';

Deno.test('test_one_param_validator_implementation', () => {
  const validator = new OneParamValidator();

  // 有効なパラメータのテスト
  const validArgs = ['init'];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, 'Valid parameter should pass validation');
  assertEquals(validResult.validatedParams, validArgs, 'Validated params should match input');

  // 無効なパラメータのテスト
  const invalidArgs = ['invalid'];
  const invalidResult = validator.validate(invalidArgs);
  assertEquals(invalidResult.isValid, false, 'Invalid parameter should fail validation');
  assertEquals(
    invalidResult.validatedParams,
    invalidArgs,
    'Validated params should contain the invalid input for tracking',
  );

  // 空の引数のテスト
  const emptyArgs: string[] = [];
  const emptyResult = validator.validate(emptyArgs);
  assertEquals(emptyResult.isValid, false, 'Empty arguments should fail validation');
  assertEquals(
    emptyResult.validatedParams,
    emptyArgs,
    'Validated params should contain the empty input for tracking',
  );

  // 複数の引数のテスト
  const multipleArgs = ['init', 'to'];
  const multipleResult = validator.validate(multipleArgs);
  assertEquals(multipleResult.isValid, false, 'Multiple arguments should fail validation');
  assertEquals(
    multipleResult.validatedParams,
    multipleArgs,
    'Validated params should contain the multiple args for tracking',
  );
});
