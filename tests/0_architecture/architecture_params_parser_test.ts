import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { ParamsParser } from '../../src/parser/params_parser.ts';
import { DEFAULT_OPTION_RULE } from '../../src/parser/params_parser.ts';

Deno.test('test_params_parser_interface', () => {
  const parser = new ParamsParser(DEFAULT_OPTION_RULE);
  assertEquals(typeof parser.parse, 'function');
});

Deno.test('test_params_parser_constructor', () => {
  const parser = new ParamsParser(DEFAULT_OPTION_RULE);
  assertEquals(parser instanceof ParamsParser, true);
});

Deno.test('test_params_parser_default_option_rule', () => {
  const parser = new ParamsParser();
  assertEquals(parser instanceof ParamsParser, true);
  const result = parser.parse(['--help']);
  assertEquals(result.type, 'zero');
  assertEquals(result.options.help, undefined, 'Flag option should be undefined');
});
