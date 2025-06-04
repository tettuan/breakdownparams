import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ValidationResult } from '../../src/result/types.ts';

Deno.test('test_validation_result_structure', () => {
  const successResult: ValidationResult = {
    isValid: true,
    validatedParams: ['param1', 'param2'],
    demonstrativeType: 'type1',
    layerType: 'layer1',
    options: {
      '--key1': 'value1',
      '--key2': 'value2',
    },
  };

  const errorResult: ValidationResult = {
    isValid: false,
    validatedParams: [],
    errorMessage: 'Validation error',
    errorCode: 'INVALID_PARAM',
    errorCategory: 'validation',
    errorDetails: {
      field: 'param1',
      reason: 'Invalid value',
    },
  };

  // 成功ケースのテスト
  assertEquals(successResult.isValid, true, 'isValid should be true');
  assertEquals(
    Array.isArray(successResult.validatedParams),
    true,
    'validatedParams should be an array',
  );
  assertEquals(
    typeof successResult.demonstrativeType,
    'string',
    'demonstrativeType should be a string',
  );
  assertEquals(typeof successResult.layerType, 'string', 'layerType should be a string');
  assertEquals(typeof successResult.options, 'object', 'options should be an object');

  // エラーケースのテスト
  assertEquals(errorResult.isValid, false, 'isValid should be false');
  assertEquals(
    Array.isArray(errorResult.validatedParams),
    true,
    'validatedParams should be an array',
  );
  assertEquals(typeof errorResult.errorMessage, 'string', 'errorMessage should be a string');
  assertEquals(typeof errorResult.errorCode, 'string', 'errorCode should be a string');
  assertEquals(typeof errorResult.errorCategory, 'string', 'errorCategory should be a string');
  assertEquals(typeof errorResult.errorDetails, 'object', 'errorDetails should be an object');
});
