import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import {
  OneParamResult,
  ParamsResult,
  TwoParamResult,
  ZeroParamsResult,
} from '../types/params_result.ts';

// 1. 型変換のテスト
Deno.test('test_type_conversion', () => {
  // ZeroParamsResult への変換
  const zeroResult: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  const zeroParamsResult = zeroResult as ZeroParamsResult;
  assertEquals(zeroParamsResult.type, 'zero');

  // OneParamResult への変換
  const oneResult: OneParamResult = {
    type: 'one',
    params: ['init'],
    options: {},
    demonstrativeType: 'init',
  };
  const oneParamResult = oneResult as OneParamResult;
  assertEquals(oneParamResult.type, 'one');
  assertEquals(oneParamResult.demonstrativeType, 'init');

  // TwoParamResult への変換
  const twoResult: TwoParamResult = {
    type: 'two',
    params: ['to', 'project'],
    options: {},
    demonstrativeType: 'to',
    layerType: 'project',
  };
  const twoParamResult = twoResult as TwoParamResult;
  assertEquals(twoParamResult.type, 'two');
  assertEquals(twoParamResult.demonstrativeType, 'to');
  assertEquals(twoParamResult.layerType, 'project');
});

// 2. options の型安全性テスト
Deno.test('test_options_type_safety', () => {
  const options: Record<string, unknown> = {
    fromFile: 'input.txt',
    destinationFile: 'output.txt',
    fromLayerType: 'project',
    adaptationType: 'default',
    configFile: 'config.json',
    customVariables: {
      key1: 'value1',
      key2: 'value2',
    },
  };

  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options,
  };

  assertEquals(typeof result.options, 'object');
  assertEquals(result.options.fromFile, 'input.txt');
  assertEquals(result.options.destinationFile, 'output.txt');
  assertEquals(result.options.fromLayerType, 'project');
  assertEquals(result.options.adaptationType, 'default');
  assertEquals(result.options.configFile, 'config.json');
  assertEquals((result.options.customVariables as Record<string, string>).key1, 'value1');
  assertEquals((result.options.customVariables as Record<string, string>).key2, 'value2');
});
