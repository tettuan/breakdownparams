import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { CommandLineOptionFactory } from '../option_factory.ts';

Deno.test('CommandLineOptionFactory Architecture', async (t) => {
  await t.step('should create options with correct types', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--input=value']);
    assertEquals(options[0].name, '--input');
    const result = options[0].validate('--input=value');
    assert(result.isValid);
  });
});
