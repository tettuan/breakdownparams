import { assertEquals, assertExists } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/mod.ts';

Deno.test('ParamsParser Integration Tests', async (t) => {
  const parser = new ParamsParser();

  await t.step('should parse zero parameters with valid options', () => {
    const args = ['--help'];
    const result = parser.parse(args);

    assertEquals(result.type, 'zero');
    assertExists(result.options);
    assertEquals(result.params, []);
  });

  await t.step('should parse one parameter with valid options', () => {
    const args = ['init', '--from=input.txt', '--destination=output.txt'];
    const result = parser.parse(args);

    assertEquals(result.type, 'error'); // OneParam doesn't allow options
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_OPTIONS');
  });

  await t.step('should parse two parameters with valid options', () => {
    const args = ['to', 'project', '--from=source.txt', '--destination=target.txt'];
    const result = parser.parse(args);

    assertEquals(result.type, 'two');
    assertExists(result.options);
    assertEquals(result.params.length, 2);
    assertEquals(result.params[0], 'to');
    assertEquals(result.params[1], 'project');
    assertEquals(result.options.from, 'source.txt');
    assertEquals(result.options.destination, 'target.txt');
  });

  await t.step('should handle invalid option combinations', () => {
    const args = ['--help', '--from=test.txt']; // from option not allowed for zero params
    const result = parser.parse(args);

    assertEquals(result.type, 'error');
    assertExists(result.error);
    assertEquals(result.error.category, 'validation');
  });

  await t.step('should handle security validation', () => {
    const args = ['; rm -rf /']; // Malicious command
    const result = parser.parse(args);

    assertEquals(result.type, 'error');
    assertExists(result.error);
    assertEquals(result.error.category, 'security');
  });
});
