import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
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
    const args = ['input.txt', '--output', 'output.txt'];
    const result = parser.parse(args);

    assertEquals(result.type, 'one');
    assertExists(result.options);
    assertEquals(result.params.length, 1);
    assertEquals(result.params[0], 'input.txt');
  });

  await t.step('should parse two parameters with valid options', () => {
    const args = ['source.txt', 'target.txt', '--config', 'config.json'];
    const result = parser.parse(args);

    assertEquals(result.type, 'two');
    assertExists(result.options);
    assertEquals(result.params.length, 2);
  });

  await t.step('should handle invalid option combinations', () => {
    const args = ['--help', '--version']; // Assuming these are mutually exclusive
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
