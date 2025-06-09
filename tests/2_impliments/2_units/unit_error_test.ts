import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ErrorInfo, OptionRule } from "../../src/types/option_rule.ts";

Deno.test('test_validation_error', () => {
  // エラーオブジェクトのテスト
  const error: ErrorInfo = {
    message: 'Test error',
    code: 'TEST_ERROR',
    category: 'test_category',
  };
  assertEquals(error.message, 'Test error', 'Error message should match');
  assertEquals(error.code, 'TEST_ERROR', 'Error code should match');
  assertEquals(error.category, 'test_category', 'Error category should match');

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
