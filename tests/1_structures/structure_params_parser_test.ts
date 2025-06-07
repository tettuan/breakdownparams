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
  assertEquals(result.options.help, undefined, 'Flag option should be undefined');
});
