import { assertEquals } from 'jsr:@std/assert@1';
import { OneParamsResult, ParamsResult, TwoParamsResult } from '../../src/types/params_result.ts';

Deno.test('test_params_result_structure', () => {
  /**
   * Test: Basic ParamsResult structure
   *
   * Purpose:
   * Validates the fundamental structure of ParamsResult interface,
   * which is the base for all parsing result types.
   *
   * Background:
   * ParamsResult is the common interface that all specific result types
   * extend from. It must contain type discriminator, params array, and
   * options object.
   *
   * Intent:
   * - Verify type field is a string
   * - Ensure params is an array
   * - Confirm options is an object
   */
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };

  assertEquals(typeof result.type, 'string', 'type should be a string');
  assertEquals(Array.isArray(result.params), true, 'params should be an array');
  assertEquals(typeof result.options, 'object', 'options should be an object');

  /**
   * Test: Error information structure
   *
   * Purpose:
   * Validates the structure of error information within ParamsResult
   * when parsing fails.
   *
   * Background:
   * When parsing fails, the result includes an error object with
   * message, code, and category for proper error handling and debugging.
   *
   * Intent:
   * - Verify error field is an object when present
   * - Ensure error message, code, and category are strings
   * - Validate complete error information structure
   */
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
  const result: OneParamsResult = {
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
  const result: TwoParamsResult = {
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
