import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { TwoParamsValidator } from "../../src/validator/params/two_params_validator.ts"';
import { OptionRule } from "../../src/types/option_rule.ts"';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['demonstrative-type', 'layer-type'],
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

Deno.test('test_two_param_validator_implementation', () => {
  const validator = new TwoParamsValidator(optionRule);

  // 2つの引数のテスト
  const twoParams = ['to', 'project'];
  const twoParamsResult = validator.validate(twoParams);
  assertEquals(twoParamsResult.isValid, true, 'Two parameters should be valid');
  assertEquals(twoParamsResult.validatedParams, ['to', 'project'], 'Params should match');

  // 無効な引数のテスト
  const invalidParams = ['invalid'];
  const invalidResult = validator.validate(invalidParams);
  assertEquals(invalidResult.isValid, false, 'Invalid parameters should fail validation');
  assertEquals(invalidResult.validatedParams, [], 'Params should be empty for invalid input');
  assertEquals(invalidResult.errorCode, 'VALIDATION_ERROR', 'Error code should match');
});
