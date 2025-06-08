import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from './params_parser.ts';
import { OptionRule } from '../types/option_rule.ts';
import { OneParamResult, TwoParamResult, ErrorResult } from '../types/params_result.ts';
import { BreakdownLogger } from '@tettuan/breakdownlogger';

/**
 * Unit test for ParamsParser
 * Tests the specific functionality and behavior of ParamsParser
 */
Deno.test('test_params_parser_unit', () => {
  const optionRule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      customVariables: ['--demonstrative-type', '--layer-type'],
      requiredOptions: [],
      valueTypes: ['string'],
    },
    errorHandling: {
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
    },
  };

  const parser = new ParamsParser(optionRule);
  const logger = new BreakdownLogger();

  // Test options only functionality
  const optionsOnlyArgs = ['--help', '--version'];
  const optionsOnlyResult = parser.parse(optionsOnlyArgs);
  assertEquals(optionsOnlyResult.type, 'zero', 'Options only should be zero type');
  assertEquals(optionsOnlyResult.params, [], 'Params should be empty for options only');
  assertEquals(
    optionsOnlyResult.options,
    { help: true, version: true },
    'Options should match',
  );

  // Test one param functionality
  const oneParamArgs = ['init'];
  logger.debug('oneParamArgs', oneParamArgs);
  const oneParamResult = parser.parse(oneParamArgs) as OneParamResult;
  logger.debug('oneParamResult', oneParamResult);
  assertEquals(oneParamResult.type, 'one', 'One parameter should be one type');
  assertEquals(oneParamResult.params, ['init'], 'Params should match');
  assertEquals(oneParamResult.options, {}, 'Options should be empty');
  assertEquals(oneParamResult.demonstrativeType, 'init', 'Demonstrative type should match');

  // Test two params functionality with valid demonstrative and layer types
  const twoParamArgs = ['summary', 'task'];
  const twoParamResult = parser.parse(twoParamArgs) as TwoParamResult;
  assertEquals(twoParamResult.type, 'two', 'Two parameters should be two type');
  assertEquals(twoParamResult.params, ['summary', 'task'], 'Params should match');
  assertEquals(twoParamResult.options, {}, 'Options should be empty');
  assertEquals(twoParamResult.demonstrativeType, 'summary', 'Demonstrative type should match');
  assertEquals(twoParamResult.layerType, 'task', 'Layer type should match');

  // Test two params with options functionality
  const twoParamWithOptionsArgs = ['summary', 'task', '--from=src', '--destination=dist'];
  const twoParamWithOptionsResult = parser.parse(twoParamWithOptionsArgs) as TwoParamResult;
  assertEquals(
    twoParamWithOptionsResult.type,
    'two',
    'Two parameters with options should be two type',
  );
  assertEquals(twoParamWithOptionsResult.params, ['summary', 'task'], 'Params should match');
  assertEquals(
    twoParamWithOptionsResult.options,
    { from: 'src', destination: 'dist' },
    'Options should match',
  );
  assertEquals(
    twoParamWithOptionsResult.demonstrativeType,
    'summary',
    'Demonstrative type should match',
  );
  assertEquals(twoParamWithOptionsResult.layerType, 'task', 'Layer type should match');

  // Test invalid input functionality
  const invalidArgs = ['invalid'];
  const invalidResult = parser.parse(invalidArgs) as ErrorResult;
  assertEquals(invalidResult.type, 'error', 'Invalid arguments should be error type');
  assertEquals(invalidResult.params, [], 'Params should be empty for invalid input');
  assertEquals(invalidResult.options, {}, 'Options should be empty for invalid input');
  assertEquals(invalidResult.error?.code, 'INVALID_PARAMS', 'Error code should match');
}); 