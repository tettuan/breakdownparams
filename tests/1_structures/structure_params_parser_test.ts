import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/parser/params_parser.ts';
import { OptionRule } from '../../src/types/option_rule.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  rules: {
    customVariables: ['uv-project', 'uv-version', 'uv-environment'],
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
  assertEquals(parser instanceof ParamsParser, true);
});

Deno.test('test_params_parser_default_structure', () => {
  const parser = new ParamsParser();
  assertEquals(typeof parser.parse, 'function');
  assertEquals(parser instanceof ParamsParser, true);

  // Test default option rule structure
  const result = parser.parse(['--help']);
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(result.options.help, true, 'Flag option should be true when present');
});
