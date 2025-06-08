import { assert, assertEquals, assertThrows } from 'jsr:@std/assert@^0.218.2';
import { CommandLineOptionFactory } from '../option_factory.ts';

Deno.test('CommandLineOptionFactory Structure', async (t) => {
  await t.step('should handle flag options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--help']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--help');
    assert(options[0].validate().isValid);
  });

  await t.step('should handle value options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--input=value']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--input');
    assert(options[0].validate('--input=value').isValid);
  });

  await t.step('should handle custom variable options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--uv-config=value']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--uv-config');
    assert(options[0].validate('--uv-config=value').isValid);
  });

  await t.step('should handle mixed options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--help', '--input=value']);
    assertEquals(options.length, 2);
    assertEquals(options[0].name, '--help');
    assertEquals(options[1].name, '--input');
    assert(options[0].validate().isValid);
    assert(options[1].validate('--input=value').isValid);
  });

  await t.step('should throw error for value options without value', () => {
    const factory = new CommandLineOptionFactory();
    assertThrows(
      () => factory.createOptionsFromArgs(['--input']),
      Error,
      'Option --input requires a value'
    );
  });
});
