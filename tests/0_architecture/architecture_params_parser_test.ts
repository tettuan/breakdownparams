import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { ParamsParser } from '../../src/parser/params_parser.ts';
import { OptionRule } from '../../src/types/option_rule.ts';

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
  assertEquals(parser instanceof ParamsParser, true);
});

Deno.test('test_params_parser_default_option_rule', () => {
  const parser = new ParamsParser();
  assertEquals(parser instanceof ParamsParser, true);
  const result = parser.parse(['--help']);
  assertEquals(result.type, 'zero');
  assertEquals(result.options.help, true, 'Flag option should be true');
});
