import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../../src/mod.ts';
import { OptionParams } from '../../src/types/option_type.ts';

Deno.test('Command Line E2E Tests', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle help command', () => {
    const args = ['--help'];
    const result = parser.parse(args);

    assertEquals(result.type, 'zero');
    assertExists(result.options.help);
  });

  await t.step('should handle file conversion with one parameter', () => {
    const args = ['input.txt', '--output', 'output.txt', '--format', 'json'];
    const result = parser.parse(args);

    assertEquals(result.type, 'one');
    assertEquals(result.params[0], 'input.txt');
    assertExists(result.options.output);
    assertExists(result.options.format);
  });

  await t.step('should handle file comparison with two parameters', () => {
    const args = ['file1.txt', 'file2.txt', '--diff', '--ignore-case'];
    const result = parser.parse(args);

    assertEquals(result.type, 'two');
    assertEquals(result.params[0], 'file1.txt');
    assertEquals(result.params[1], 'file2.txt');
    assertExists(result.options.diff);
    assertExists(result.options.ignoreCase);
  });

  await t.step('should handle custom variables', () => {
    const args = ['--var', 'key1=value1', '--var', 'key2=value2'];
    const result = parser.parse(args);

    assertEquals(result.type, 'zero');
    const options = result.options as OptionParams;
    assertExists(options.customVariables);
    assertEquals(options.customVariables?.key1, 'value1');
    assertEquals(options.customVariables?.key2, 'value2');
  });

  await t.step('should handle configuration file', () => {
    const args = ['--config', 'config.json'];
    const result = parser.parse(args);

    assertEquals(result.type, 'zero');
    const options = result.options as OptionParams;
    assertExists(options.configFile);
    assertEquals(options.configFile, 'config.json');
  });
});
