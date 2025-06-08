import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { CommandLineOptionFactory } from '../option_factory.ts';

Deno.test('CommandLineOptionFactory Architecture', async (t) => {
  const factory = new CommandLineOptionFactory();

  await t.step('should create options with correct types', () => {
    const options = factory.createOptionsFromArgs(['--input=value']);
    assertEquals(options.length, 1);
    assertEquals(options[0].name, 'input');
    assertEquals(options[0].validate('--input=value').isValid, true);
  });
});
