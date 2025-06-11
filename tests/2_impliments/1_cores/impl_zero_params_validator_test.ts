import { assertEquals } from 'jsr:@std/assert@1';
import { ZeroParamsValidator } from '../../../src/validator/params/zero_params_validator.ts';

Deno.test('test_zero_params_validator_implementation', () => {
  const validator = new ZeroParamsValidator();

  // パラメータなしのテスト
  const validArgs: string[] = [];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, 'Zero parameters should pass validation');
  assertEquals(validResult.validatedParams, validArgs, 'Validated params should match input');

  // パラメータがある場合のテスト
  const withParams = ['init'];
  const withParamsResult = validator.validate(withParams);
  assertEquals(withParamsResult.isValid, false, 'Parameters should fail validation');
  assertEquals(
    withParamsResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  // 空の引数のテスト
  const emptyArgs: string[] = [];
  const emptyResult = validator.validate(emptyArgs);
  assertEquals(emptyResult.isValid, true, 'Empty arguments should pass validation');
  assertEquals(emptyResult.validatedParams, [], 'Validated params should be empty for empty input');

  // 無効なオプションのテスト
  const invalidOptionArgs = ['--invalid-option'];
  const invalidOptionResult = validator.validate(invalidOptionArgs);
  assertEquals(invalidOptionResult.isValid, false, 'Invalid options should fail validation');
  assertEquals(
    invalidOptionResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  // 複数の位置引数のテスト
  const multiplePositionalArgs = ['init', 'to', 'project'];
  const multiplePositionalResult = validator.validate(multiplePositionalArgs);
  assertEquals(
    multiplePositionalResult.isValid,
    false,
    'Multiple positional arguments should fail validation',
  );
  assertEquals(
    multiplePositionalResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  // 混合ケースのテスト
  const mixedArgs = ['--help', 'init', '--version'];
  const mixedResult = validator.validate(mixedArgs);
  assertEquals(
    mixedResult.isValid,
    false,
    'Mixed options and positional arguments should fail validation',
  );
  assertEquals(
    mixedResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );
});
