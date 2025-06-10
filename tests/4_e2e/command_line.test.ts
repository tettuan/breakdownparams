import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../../src/mod.ts';

Deno.test('Command Line E2E Tests', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle help command', () => {
    const args = ['--help'];
    const result = parser.parse(args);

    assertEquals(result.type, 'zero');
    assertExists(result.options.help);
  });

  await t.step('should handle file conversion with one parameter', () => {
    const args = ['init', '--from=input.txt', '--destination=output.txt'];
    const result = parser.parse(args);

    assertEquals(result.type, 'error'); // OneParam doesn't allow options
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_OPTIONS');
  });

  await t.step('should handle file comparison with two parameters', () => {
    const args = ['defect', 'issue', '--from=file1.txt', '--destination=file2.txt'];
    const result = parser.parse(args);

    assertEquals(result.type, 'two');
    assertEquals(result.params[0], 'defect');
    assertEquals(result.params[1], 'issue');
    assertEquals(result.options.from, 'file1.txt');
    assertEquals(result.options.destination, 'file2.txt');
  });

  await t.step('should handle custom variables', () => {
    const args = ['to', 'task', '--uv-key1=value1', '--uv-key2=value2'];
    const result = parser.parse(args);

    assertEquals(result.type, 'two');
    assertEquals(result.params[0], 'to');
    assertEquals(result.params[1], 'task');
    assertEquals(result.options['uv-key1'], 'value1');
    assertEquals(result.options['uv-key2'], 'value2');
  });

  await t.step('should handle configuration file', () => {
    const args = ['init', '--config=config.json'];
    const result = parser.parse(args);

    assertEquals(result.type, 'error'); // OneParam doesn't allow options
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_OPTIONS');
  });
});
