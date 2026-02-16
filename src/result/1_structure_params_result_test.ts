import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type {
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../types/params_result.ts';

const logger = new BreakdownLogger("result");

// 2. Structure tests for each result type
Deno.test('test_zero_params_result_structure', () => {
  const result: ZeroParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  logger.debug("zero params result", { result });
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
});

Deno.test('test_one_param_result_structure', () => {
  const result: OneParamsResult = {
    type: 'one',
    params: ['init'],
    options: {},
    directiveType: 'init',
  };
  logger.debug("one param result", { result });
  assertEquals(result.type, 'one');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(result.directiveType, 'init');
});

Deno.test('test_two_param_result_structure', () => {
  const result: TwoParamsResult = {
    type: 'two',
    params: ['to', 'project'],
    options: {},
    directiveType: 'to',
    layerType: 'project',
  };
  logger.debug("two param result", { result });
  assertEquals(result.type, 'two');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(result.directiveType, 'to');
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
  logger.debug("error result", { errorResult });

  assertEquals(errorResult.type, 'error');
  assertEquals(typeof errorResult.error, 'object');
  assertEquals(errorResult.error?.message, 'Error message');
  assertEquals(errorResult.error?.code, 'ERROR_CODE');
  assertEquals(errorResult.error?.category, 'error_category');
});
