import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { ParamsResult } from '../types/params_result.ts';

// 1. インターフェースの基本設計テスト
Deno.test('test_params_result_interface', () => {
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
});
