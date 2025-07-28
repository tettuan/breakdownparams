import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import {
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../types/params_result.ts';

// 1. Type conversion tests
Deno.test('test_type_conversion', () => {
  // Conversion to ZeroParamsResult
  const zeroResult: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  const zeroParamsResult = zeroResult as ZeroParamsResult;
  assertEquals(zeroParamsResult.type, 'zero');

  // Conversion to OneParamsResult
  const oneResult: OneParamsResult = {
    type: 'one',
    params: ['init'],
    options: {},
    directiveType: 'init',
  };
  const oneParamResult = oneResult as OneParamsResult;
  assertEquals(oneParamResult.type, 'one');
  assertEquals(oneParamResult.directiveType, 'init');

  // Conversion to TwoParamsResult
  const twoResult: TwoParamsResult = {
    type: 'two',
    params: ['to', 'project'],
    options: {},
    directiveType: 'to',
    layerType: 'project',
  };
  const twoParamResult = twoResult as TwoParamsResult;
  assertEquals(twoParamResult.type, 'two');
  assertEquals(twoParamResult.directiveType, 'to');
  assertEquals(twoParamResult.layerType, 'project');
});

// 2. Type safety tests for options
Deno.test('test_options_type_safety', () => {
  const options: Record<string, unknown> = {
    fromFile: 'input.txt',
    destinationFile: 'output.txt',
    fromLayerType: 'project',
    adaptationType: 'default',
    configFile: 'config.json',
    userVariables: {
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
  assertEquals((result.options.userVariables as Record<string, string>).key1, 'value1');
  assertEquals((result.options.userVariables as Record<string, string>).key2, 'value2');
});
