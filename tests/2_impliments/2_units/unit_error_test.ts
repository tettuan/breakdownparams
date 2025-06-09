import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule } from "../../../src/types/option_rule.ts";
import { ErrorInfo } from "../../../src/types/params_result.ts";

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
    flagOptions: {
      help: true,
      version: true,
    },
  };

  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assertEquals(
    Array.isArray(optionRule.rules.customVariables),
    true,
    'customVariables should be an array',
  );
  assertEquals(typeof optionRule.errorHandling.emptyValue, 'string', 'emptyValue should be a string');
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
