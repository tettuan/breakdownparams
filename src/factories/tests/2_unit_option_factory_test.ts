import { assert, assertEquals, assertThrows } from 'jsr:@std/assert@^0.218.2';
import { CommandLineOptionFactory } from '../option_factory.ts';

Deno.test('CommandLineOptionFactory Unit Tests', async (t) => {
  await t.step('should handle empty command line arguments', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs([]);
    assertEquals(options.length, 0);
  });

  await t.step('should throw error for unknown options', () => {
    const factory = new CommandLineOptionFactory();
    assertThrows(
      () => factory.createOptionsFromArgs(['--unknown']),
      Error,
      'Unknown option: --unknown',
    );
  });

  await t.step('should handle flag options with both long and short names', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--help', '-h']);
    assertEquals(options.length, 2);
    assertEquals(options[0].name, '--help');
    assertEquals(options[1].name, '--help');
    assert(options[0].validate().isValid);
    assert(options[1].validate().isValid);
  });

  await t.step('should handle value options with both long and short names', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--input=value', '-i=value']);
    assertEquals(options.length, 2);
    assertEquals(options[0].name, '--edition');
    assertEquals(options[1].name, '--edition');
    assert(options[0].validate('--input=value').isValid);
    assert(options[1].validate('-i=value').isValid);
  });

  await t.step('should throw error for value options without value', () => {
    const factory = new CommandLineOptionFactory();
    assertThrows(
      () => factory.createOptionsFromArgs(['--input']),
      Error,
      'Option --input requires a value',
    );
  });

  await t.step('should handle user variable options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--uv-config=value']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--uv-config');
    assert(options[0].validate('--uv-config=value').isValid);
  });
});
