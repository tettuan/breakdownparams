import { assert, assertEquals, assertThrows } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { CommandLineOptionFactory } from '../option_factory.ts';

const logger = new BreakdownLogger("factory");

Deno.test('CommandLineOptionFactory Structure', async (t) => {
  await t.step('should handle flag options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--help']);
    logger.debug("Factory flag options created", { data: { count: options.length, name: options[0].name } });
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--help');
    assert(options[0].validate().isValid);
  });

  await t.step('should handle value options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--input=value']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--edition');
    assert(options[0].validate('--input=value').isValid);
  });

  await t.step('should handle user variable options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--uv-config=value']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, '--uv-config');
    assert(options[0].validate('--uv-config=value').isValid);
  });

  await t.step('should handle mixed options', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--help', '--input=value']);
    logger.debug("Factory mixed options created", { data: { count: options.length, names: options.map((o) => o.name) } });
    assertEquals(options.length, 2);
    assertEquals(options[0].name, '--help');
    assertEquals(options[1].name, '--edition');
    assert(options[0].validate().isValid);
    assert(options[1].validate('--input=value').isValid);
  });

  await t.step('should throw error for value options without value', () => {
    const factory = new CommandLineOptionFactory();
    assertThrows(
      () => factory.createOptionsFromArgs(['--input']),
      Error,
      'Option --input requires a value',
    );
  });
});
