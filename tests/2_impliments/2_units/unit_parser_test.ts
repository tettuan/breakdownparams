import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule, ParamsResult } from '../../../src/result/types.ts';

Deno.test('test_params_parser', () => {
  // パラメータ結果のテスト
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(result.type, 'zero', 'Result type should be zero');
  assertEquals(result.params, [], 'Params should be empty');
  assertEquals(result.options, {}, 'Options should be empty');
  assertEquals(result.error, undefined, 'Error should be undefined');

  // オプションルールのテスト
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

  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assertEquals(
    Array.isArray(optionRule.validation.customVariables),
    true,
    'customVariables should be an array',
  );
  assertEquals(typeof optionRule.validation.emptyValue, 'string', 'emptyValue should be a string');
  assertEquals(
    typeof optionRule.validation.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof optionRule.validation.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assertEquals(
    Array.isArray(optionRule.validation.requiredOptions),
    true,
    'requiredOptions should be an array',
  );
  assertEquals(
    Array.isArray(optionRule.validation.valueTypes),
    true,
    'valueTypes should be an array',
  );
  assertEquals(typeof optionRule.flagOptions, 'object', 'flagOptions should be an object');
});
