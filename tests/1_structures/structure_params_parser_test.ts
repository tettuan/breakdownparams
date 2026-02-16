import { assert, assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ParamsParser } from '../../src/parser/params_parser.ts';
import type { OptionRule } from '../../src/types/option_rule.ts';

const logger = new BreakdownLogger('parser');

const optionRule: OptionRule = {
  format: '--key=value',
  rules: {
    userVariables: ['uv-project', 'uv-version', 'uv-environment'],
    requiredOptions: [],
    valueTypes: ['string'],
  },
  errorHandling: {
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
  },
  flagOptions: {
    help: true,
    version: true,
  },
};

Deno.test('test_params_parser_structure', () => {
  const parser = new ParamsParser(optionRule);
  assertEquals(typeof parser.parse, 'function');
  assert(parser instanceof ParamsParser);
});

Deno.test('test_params_parser_default_structure', () => {
  const parser = new ParamsParser();
  assertEquals(typeof parser.parse, 'function');
  assert(parser instanceof ParamsParser);

  // Test default option rule structure
  const result = parser.parse(['--help']);
  logger.debug('parse result with default structure', {
    data: { type: result.type, params: result.params, options: result.options },
  });
  assertEquals(result.type, 'zero');
  assert(Array.isArray(result.params));
  assertEquals(typeof result.options, 'object');
  assert(result.options.help, 'Flag option should be true when present');
});
