import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from './params_parser.ts';
import { OptionRule } from '../types/option_rule.ts';
import { ParamsResult } from '../types/params_result.ts';

/**
 * Architecture test for ParamsParser
 * Tests the high-level design and interface of ParamsParser
 */
Deno.test('test_params_parser_architecture', () => {
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

  // Test interface contract
  const result = parser.parse(['--help']);
  assertEquals(typeof result, 'object', 'Result should be an object');
  assertEquals('type' in result, true, 'Result should have a type property');
  assertEquals('params' in result, true, 'Result should have a params property');
  assertEquals('options' in result, true, 'Result should have an options property');

  // Test error handling contract
  const errorResult = parser.parse(['invalid']) as ParamsResult;
  assertEquals(errorResult.type, 'error', 'Invalid input should return error type');
  assertEquals('error' in errorResult, true, 'Error result should have an error property');
  assertEquals(typeof errorResult.error?.message, 'string', 'Error should have a message');
  assertEquals(typeof errorResult.error?.code, 'string', 'Error should have a code');
  assertEquals(typeof errorResult.error?.category, 'string', 'Error should have a category');
});
