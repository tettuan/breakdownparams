import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import type { OptionRule } from '../../../src/types/option_rule.ts';
import type {
  ErrorInfo,
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../../../src/types/params_result.ts';
import type { ValidationResult } from '../../../src/types/validation_result.ts';

Deno.test('test_result_unit', () => {
  // ParamsResultのテスト
  const paramsResult: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(typeof paramsResult.type, 'string', 'type should be a string');
  assertEquals(Array.isArray(paramsResult.params), true, 'params should be an array');
  assertEquals(typeof paramsResult.options, 'object', 'options should be an object');

  // ZeroParamsResultのテスト
  const zeroParamsResult: ZeroParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(zeroParamsResult.type, 'zero', 'type should be zero');
  assertEquals(Array.isArray(zeroParamsResult.params), true, 'params should be an array');
  assertEquals(typeof zeroParamsResult.options, 'object', 'options should be an object');

  // OneParamsResultのテスト
  const oneParamResult: OneParamsResult = {
    type: 'one',
    params: ['init'],
    options: {},
    demonstrativeType: 'init',
  };
  assertEquals(oneParamResult.type, 'one', 'type should be one');
  assertEquals(Array.isArray(oneParamResult.params), true, 'params should be an array');
  assertEquals(typeof oneParamResult.options, 'object', 'options should be an object');
  assertEquals(
    typeof oneParamResult.demonstrativeType,
    'string',
    'demonstrativeType should be a string',
  );

  // TwoParamsResultのテスト
  const twoParamsResult: TwoParamsResult = {
    type: 'two',
    params: ['to', 'project'],
    options: {},
    demonstrativeType: 'to',
    layerType: 'project',
  };
  assertEquals(twoParamsResult.type, 'two', 'type should be two');
  assertEquals(Array.isArray(twoParamsResult.params), true, 'params should be an array');
  assertEquals(typeof twoParamsResult.options, 'object', 'options should be an object');
  assertEquals(
    typeof twoParamsResult.demonstrativeType,
    'string',
    'demonstrativeType should be a string',
  );
  assertEquals(typeof twoParamsResult.layerType, 'string', 'layerType should be a string');

  // ErrorInfoのテスト
  const errorInfo: ErrorInfo = {
    message: 'Test error',
    code: 'TEST_ERROR',
    category: 'test_category',
  };
  assertEquals(typeof errorInfo.message, 'string', 'message should be a string');
  assertEquals(typeof errorInfo.code, 'string', 'code should be a string');
  assertEquals(typeof errorInfo.category, 'string', 'category should be a string');

  // ValidationResultのテスト
  const validationResult: ValidationResult = {
    isValid: true,
    validatedParams: ['test'],
  };
  assertEquals(typeof validationResult.isValid, 'boolean', 'isValid should be a boolean');
  assertEquals(
    Array.isArray(validationResult.validatedParams),
    true,
    'validatedParams should be an array',
  );

  // OptionRuleのテスト
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

Deno.test('test_validation_result', () => {
  // 成功結果のテスト
  const successResult: ValidationResult = {
    isValid: true,
    validatedParams: ['test'],
  };
  assertEquals(successResult.isValid, true, 'Success result should be valid');
  assertEquals(successResult.validatedParams, ['test'], 'Validated params should match');
  assertEquals(successResult.errorMessage, undefined, 'Error message should be undefined');
  assertEquals(successResult.errorCode, undefined, 'Error code should be undefined');
  assertEquals(successResult.errorCategory, undefined, 'Error category should be undefined');

  // エラー結果のテスト
  const errorResult: ValidationResult = {
    isValid: false,
    validatedParams: [],
    errorMessage: 'Test error',
    errorCode: 'TEST_ERROR',
    errorCategory: 'test_category',
  };
  assertEquals(errorResult.isValid, false, 'Error result should be invalid');
  assertEquals(errorResult.validatedParams, [], 'Validated params should be empty');
  assertEquals(errorResult.errorMessage, 'Test error', 'Error message should match');
  assertEquals(errorResult.errorCode, 'TEST_ERROR', 'Error code should match');
  assertEquals(errorResult.errorCategory, 'test_category', 'Error category should match');

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
