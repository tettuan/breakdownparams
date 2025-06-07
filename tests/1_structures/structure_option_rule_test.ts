import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { ParamsParser, DEFAULT_OPTION_RULE } from '../../src/parser/params_parser.ts';

Deno.test('test_params_parser_structure', () => {
  const parser = new ParamsParser(DEFAULT_OPTION_RULE);
  assertEquals(typeof parser.parse, 'function');
  assertEquals(parser instanceof ParamsParser, true);
});

Deno.test('test_params_parser_default_behavior', () => {
  const parser = new ParamsParser(DEFAULT_OPTION_RULE);
  const result = parser.parse(['--help']);
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(result.options.help, undefined, 'Flag option should be undefined');
});
