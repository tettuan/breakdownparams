import { assertEquals, assertThrows } from 'jsr:@std/assert@^0.218.2';
import { CommandLineOptionFactory } from '../option_factory.ts';

Deno.test('CommandLineOptionFactory Unit Tests', async (t) => {
  const factory = new CommandLineOptionFactory();

  await t.step('should handle empty command line arguments', () => {
    const options = factory.createOptionsFromArgs([]);
    assertEquals(options.length, 0);
  });

  await t.step('should throw error for unknown options', () => {
    assertThrows(
      () => factory.createOptionsFromArgs(['invalid']),
      Error,
      'Unknown option: invalid',
    );
  });

  await t.step('should handle flag options with both long and short names', () => {
    const options = factory.createOptionsFromArgs(['--help', '-h']);
    assertEquals(options.length, 2);
    assertEquals(options[0].name, 'help');
    assertEquals(options[0].validate('--help').isValid, true);
    assertEquals(options[1].name, 'help');
    assertEquals(options[1].validate('-h').isValid, true);
  });

  await t.step('should handle value options with both long and short names', () => {
    const options = factory.createOptionsFromArgs(['--input=value', '-i=value']);
    assertEquals(options.length, 2);
    assertEquals(options[0].name, 'input');
    assertEquals(options[0].validate('--input=value').isValid, true);
    assertEquals(options[1].name, 'input');
    assertEquals(options[1].validate('-i=value').isValid, true);
  });

  await t.step('should throw error for value options without value', () => {
    assertThrows(
      () => factory.createOptionsFromArgs(['--input']),
      Error,
      'Option --input requires a value',
    );
  });

  await t.step('should handle custom variable options', () => {
    const options = factory.createOptionsFromArgs(['--uv-config=value']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--uv-config');
    assertEquals(options[0].validate('--uv-config=value').isValid, true);
  });
});
