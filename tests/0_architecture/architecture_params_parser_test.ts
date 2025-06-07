import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { ParamsParser } from '../../src/parser/params_parser.ts';
import { OptionRule } from '../../src/result/types.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['uv-project', 'uv-version', 'uv-environment'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
  paramSpecificOptions: {
    zero: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    one: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    two: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
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
  assertEquals(result.options.help, undefined, 'Flag option should be undefined');
});
