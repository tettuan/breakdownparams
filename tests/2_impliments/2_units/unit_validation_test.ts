import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule, ValidationResult } from '../../../src/result/types.ts';

Deno.test('test_validation_result', () => {
  // 成功結果のテスト
  const successResult: ValidationResult = {
    isValid: true,
    validatedParams: ['test'],
  };
  assertEquals(successResult.isValid, true, 'Success result should be valid');
  assertEquals(successResult.validatedParams, ['test'], 'Validated params should match');
  assertEquals(successResult.error, undefined, 'Error should be undefined');

  // エラー結果のテスト
  const errorResult: ValidationResult = {
    isValid: false,
    validatedParams: [],
    error: {
      message: 'Test error',
      code: 'TEST_ERROR',
      category: 'test_category',
    },
  };
  assertEquals(errorResult.isValid, false, 'Error result should be invalid');
  assertEquals(errorResult.validatedParams, [], 'Validated params should be empty');
  assertEquals(errorResult.error?.message, 'Test error', 'Error message should match');
  assertEquals(errorResult.error?.code, 'TEST_ERROR', 'Error code should match');
  assertEquals(errorResult.error?.category, 'test_category', 'Error category should match');

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
