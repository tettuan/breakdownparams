import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from './params_parser.ts';
import { OptionRule } from '../types/option_rule.ts';
import { OneParamsResult, TwoParamsResult, ZeroParamsResult } from '../types/params_result.ts';
import { BreakdownLogger } from '@tettuan/breakdownlogger';

/**
 * Structure test for ParamsParser
 * Tests the data structures and relationships in ParamsParser
 */
Deno.test('test_params_parser_structure_with_option_rule', () => {
  const optionRule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      userVariables: ['--directive-type', '--layer-type'],
      requiredOptions: ['from'],
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

  // Test zero params structure
  const zeroResult = parser.parse(['--help']) as ZeroParamsResult;
  assertEquals(zeroResult.type, 'zero', 'Zero params should have type zero');
  assertEquals(Array.isArray(zeroResult.params), true, 'Params should be an array');
  assertEquals(zeroResult.params.length, 0, 'Zero params should have empty array');
  assertEquals(typeof zeroResult.options, 'object', 'Options should be an object');

  // Test one param structure
  const oneResult = parser.parse(['init']) as OneParamsResult;
  assertEquals(oneResult.type, 'one', 'One param should have type one');
  assertEquals(Array.isArray(oneResult.params), true, 'Params should be an array');
  assertEquals(oneResult.params.length, 1, 'One param should have one element');
  assertEquals(typeof oneResult.directiveType, 'string', 'Should have directive type');
  assertEquals(typeof oneResult.options, 'object', 'Options should be an object');

  // Test two params structure with valid directive and layer types
  const twoResult = parser.parse([
    'summary',
    'task',
    '--from=input.txt',
    '--destination=output.txt',
  ]) as TwoParamsResult;
  logger.debug('Two params result:', twoResult);
  assertEquals(twoResult.type, 'two', 'Two params should have type two');
  assertEquals(Array.isArray(twoResult.params), true, 'Params should be an array');
  assertEquals(twoResult.params.length, 2, 'Two params should have two elements');
  assertEquals(typeof twoResult.directiveType, 'string', 'Should have directive type');
  assertEquals(typeof twoResult.layerType, 'string', 'Should have layer type');
  assertEquals(typeof twoResult.options, 'object', 'Options should be an object');
});

Deno.test('test_params_parser_structure_without_option_rule', () => {
  const parser = new ParamsParser();
  const logger = new BreakdownLogger();

  // Test zero params structure
  const zeroResult = parser.parse(['--help']) as ZeroParamsResult;
  assertEquals(zeroResult.type, 'zero', 'Zero params should have type zero');
  assertEquals(Array.isArray(zeroResult.params), true, 'Params should be an array');
  assertEquals(zeroResult.params.length, 0, 'Zero params should have empty array');
  assertEquals(typeof zeroResult.options, 'object', 'Options should be an object');

  // Test one param structure
  const oneResult = parser.parse(['init']) as OneParamsResult;
  assertEquals(oneResult.type, 'one', 'One param should have type one');
  assertEquals(Array.isArray(oneResult.params), true, 'Params should be an array');
  assertEquals(oneResult.params.length, 1, 'One param should have one element');
  assertEquals(typeof oneResult.directiveType, 'string', 'Should have directive type');
  assertEquals(typeof oneResult.options, 'object', 'Options should be an object');

  // Test two params structure with valid directive and layer types
  const twoResult = parser.parse([
    'summary',
    'task',
    '--from=input.txt',
    '--destination=output.txt',
  ]) as TwoParamsResult;
  logger.debug('Two params result:', twoResult);
  assertEquals(twoResult.type, 'two', 'Two params should have type two');
  assertEquals(Array.isArray(twoResult.params), true, 'Params should be an array');
  assertEquals(twoResult.params.length, 2, 'Two params should have two elements');
  assertEquals(typeof twoResult.directiveType, 'string', 'Should have directive type');
  assertEquals(typeof twoResult.layerType, 'string', 'Should have layer type');
  assertEquals(typeof twoResult.options, 'object', 'Options should be an object');
});
