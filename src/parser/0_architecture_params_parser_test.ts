import { assert, assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ParamsParser } from './params_parser.ts';
import type { OptionRule } from '../types/option_rule.ts';
import type { ParamsResult } from '../types/params_result.ts';

const logger = new BreakdownLogger("parser");

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
      userVariables: ['--directive-type', '--layer-type'],
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
  logger.debug("parse result for interface contract", { result });
  assertEquals(typeof result, 'object', 'Result should be an object');
  assert('type' in result, 'Result should have a type property');
  assert('params' in result, 'Result should have a params property');
  assert('options' in result, 'Result should have an options property');

  // Test error handling contract
  const errorResult = parser.parse(['invalid']) as ParamsResult;
  logger.debug("parse result for error handling", { errorResult });
  assertEquals(errorResult.type, 'error', 'Invalid input should return error type');
  assert('error' in errorResult, 'Error result should have an error property');
  assertEquals(typeof errorResult.error?.message, 'string', 'Error should have a message');
  assertEquals(typeof errorResult.error?.code, 'string', 'Error should have a code');
  assertEquals(typeof errorResult.error?.category, 'string', 'Error should have a category');
});
