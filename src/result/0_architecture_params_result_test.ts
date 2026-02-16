import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type { ParamsResult } from '../types/params_result.ts';

const logger = new BreakdownLogger('result');

// 1. Basic interface design test
Deno.test('test_params_result_interface', () => {
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  logger.debug('params result interface', { result });
  assertEquals(result.type, 'zero');
  assert(Array.isArray(result.params));
  assertEquals(typeof result.options, 'object');
});
