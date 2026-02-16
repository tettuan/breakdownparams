import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type {
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../types/params_result.ts';

const logger = new BreakdownLogger('result');

// 1. Type conversion tests
Deno.test('test_type_conversion', () => {
  // Conversion to ZeroParamsResult
  const zeroResult: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  const zeroParamsResult = zeroResult as ZeroParamsResult;
  logger.debug('zero params result after conversion', { zeroParamsResult });
  assertEquals(zeroParamsResult.type, 'zero');

  // Conversion to OneParamsResult
  const oneResult: OneParamsResult = {
    type: 'one',
    params: ['init'],
    options: {},
    directiveType: 'init',
  };
  const oneParamResult = oneResult as OneParamsResult;
  logger.debug('one param result after conversion', { oneParamResult });
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
  logger.debug('two param result after conversion', { twoParamResult });
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
  logger.debug('options type safety result', { options: result.options });

  assertEquals(typeof result.options, 'object');
  assertEquals(result.options.fromFile, 'input.txt');
  assertEquals(result.options.destinationFile, 'output.txt');
  assertEquals(result.options.fromLayerType, 'project');
  assertEquals(result.options.adaptationType, 'default');
  assertEquals(result.options.configFile, 'config.json');
  assertEquals((result.options.userVariables as Record<string, string>).key1, 'value1');
  assertEquals((result.options.userVariables as Record<string, string>).key2, 'value2');
});
