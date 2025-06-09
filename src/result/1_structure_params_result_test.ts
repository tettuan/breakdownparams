import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import {
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../types/params_result.ts';

// 2. 各結果型の構造テスト
Deno.test('test_zero_params_result_structure', () => {
  const result: ZeroParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
});

Deno.test('test_one_param_result_structure', () => {
  const result: OneParamsResult = {
    type: 'one',
    params: ['init'],
    options: {},
    demonstrativeType: 'init',
  };
  assertEquals(result.type, 'one');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(result.demonstrativeType, 'init');
});

Deno.test('test_two_param_result_structure', () => {
  const result: TwoParamsResult = {
    type: 'two',
    params: ['to', 'project'],
    options: {},
    demonstrativeType: 'to',
    layerType: 'project',
  };
  assertEquals(result.type, 'two');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(result.demonstrativeType, 'to');
  assertEquals(result.layerType, 'project');
});

Deno.test('test_error_result_structure', () => {
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

  assertEquals(errorResult.type, 'error');
  assertEquals(typeof errorResult.error, 'object');
  assertEquals(errorResult.error?.message, 'Error message');
  assertEquals(errorResult.error?.code, 'ERROR_CODE');
  assertEquals(errorResult.error?.category, 'error_category');
});
