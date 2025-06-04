import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OneParamResult, ParamsResult, TwoParamResult } from '../../src/result/types.ts';

Deno.test('test_params_result_structure', () => {
  // 基本構造のテスト
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };

  assertEquals(typeof result.type, 'string', 'type should be a string');
  assertEquals(Array.isArray(result.params), true, 'params should be an array');
  assertEquals(typeof result.options, 'object', 'options should be an object');

  // エラー情報のテスト
  const errorResult: ParamsResult = {
    type: 'error',
    params: [],
    options: {},
    error: {
      message: 'Error message',
      code: 'ERROR_CODE',
      category: 'error_category',
    },
  };

  assertEquals(typeof errorResult.error, 'object', 'error should be an object');
  assertEquals(typeof errorResult.error?.message, 'string', 'error message should be a string');
  assertEquals(typeof errorResult.error?.code, 'string', 'error code should be a string');
  assertEquals(typeof errorResult.error?.category, 'string', 'error category should be a string');
});

Deno.test('test_zero_params_result_structure', () => {
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };

  assertEquals(result.type, 'zero', 'type should be zero');
  assertEquals(Array.isArray(result.params), true, 'params should be an array');
  assertEquals(typeof result.options, 'object', 'options should be an object');
});

Deno.test('test_one_param_result_structure', () => {
  const result: OneParamResult = {
    type: 'one',
    params: ['init'],
    options: {},
    demonstrativeType: 'init',
  };

  assertEquals(result.type, 'one', 'type should be one');
  assertEquals(Array.isArray(result.params), true, 'params should be an array');
  assertEquals(typeof result.options, 'object', 'options should be an object');
  assertEquals(typeof result.demonstrativeType, 'string', 'demonstrativeType should be a string');
});

Deno.test('test_two_param_result_structure', () => {
  const result: TwoParamResult = {
    type: 'two',
    params: ['to', 'project'],
    options: {},
    demonstrativeType: 'to',
    layerType: 'project',
  };

  assertEquals(result.type, 'two', 'type should be two');
  assertEquals(Array.isArray(result.params), true, 'params should be an array');
  assertEquals(typeof result.options, 'object', 'options should be an object');
  assertEquals(typeof result.demonstrativeType, 'string', 'demonstrativeType should be a string');
  assertEquals(typeof result.layerType, 'string', 'layerType should be a string');
});
