import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ParamsParser } from '../../src/parser/params_parser.ts';
import type { OptionRule } from '../../src/types/option_rule.ts';

const logger = new BreakdownLogger('parser');

const optionRule: OptionRule = {
  format: '--key=value',
  flagOptions: {
    help: true,
    version: true,
  },
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
};

Deno.test('test_params_parser_interface', () => {
  const parser = new ParamsParser(optionRule);
  assertEquals(typeof parser.parse, 'function');
});

Deno.test('test_params_parser_constructor', () => {
  const parser = new ParamsParser(optionRule);
  assert(parser instanceof ParamsParser);
});

Deno.test('test_params_parser_default_option_rule', () => {
  const parser = new ParamsParser();
  assert(parser instanceof ParamsParser);
  const result = parser.parse(['--help']);
  logger.debug('parse result with default option rule', {
    data: { type: result.type, options: result.options },
  });
  assertEquals(result.type, 'zero');
  assert(result.options.help, 'Flag option should be true');
});
