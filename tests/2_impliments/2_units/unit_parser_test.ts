import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule } from '../../../src/types/option_rule.ts';
import { ParamsResult } from '../../../src/types/params_result.ts';

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
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      customVariables: ['--demonstrative-type', '--layer-type'],
      requiredOptions: [],
      valueTypes: ['string'],
    },
    errorHandling: {
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
    },
  };

  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assertEquals(
    Array.isArray(optionRule.rules.customVariables),
    true,
    'customVariables should be an array',
  );
  assertEquals(
    typeof optionRule.errorHandling.emptyValue,
    'string',
    'emptyValue should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assertEquals(
    Array.isArray(optionRule.rules.requiredOptions),
    true,
    'requiredOptions should be an array',
  );
  assertEquals(
    Array.isArray(optionRule.rules.valueTypes),
    true,
    'valueTypes should be an array',
  );
  assertEquals(typeof optionRule.flagOptions, 'object', 'flagOptions should be an object');
});
