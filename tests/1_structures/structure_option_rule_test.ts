import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { ParamsParser } from '../../src/parser/params_parser.ts';

Deno.test('test_params_parser_structure', () => {
  const parser = new ParamsParser();
  assertEquals(typeof parser.parse, 'function');
  assertEquals(parser instanceof ParamsParser, true);
});

Deno.test('test_params_parser_default_behavior', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['--help']);
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(result.options.help, undefined, 'Flag option should be undefined');
});
