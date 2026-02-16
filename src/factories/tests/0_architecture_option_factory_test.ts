import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { CommandLineOptionFactory } from '../option_factory.ts';

const logger = new BreakdownLogger("factory");

Deno.test('CommandLineOptionFactory Architecture', async (t) => {
  await t.step('should create options with correct types', () => {
    const factory = new CommandLineOptionFactory();
    const options = factory.createOptionsFromArgs(['--input=value']);
    logger.debug("Factory created options", { data: { optionCount: options.length, firstName: options[0].name } });
    assertEquals(options[0].name, '--edition');
    const result = options[0].validate('--input=value');
    logger.debug("Factory option validation", { data: { isValid: result.isValid } });
    assert(result.isValid);
  });
});
