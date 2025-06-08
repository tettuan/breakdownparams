import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ZeroParamsValidator } from "../../src/validator/params/zero_params_validator.ts"';
import { OptionRule } from "../../src/types/option_rule.ts"';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--demonstrative-type', '--layer-type'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
};

Deno.test('test_zero_params_validator_implementation', () => {
  const validator = new ZeroParamsValidator(optionRule);

  // オプションのみのテスト
  const validArgs = ['--help', '--version'];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, 'Options only should pass validation');
  assertEquals(validResult.validatedParams, validArgs, 'Validated params should match input');

  // 位置引数がある場合のテスト
  const withPositionalArgs = ['--help', 'init'];
  const withPositionalResult = validator.validate(withPositionalArgs);
  assertEquals(withPositionalResult.isValid, false, 'Positional arguments should fail validation');
  assertEquals(
    withPositionalResult.validatedParams,
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
