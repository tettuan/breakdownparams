import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../flag_option.ts';

Deno.test('FlagOption Unit Tests', async (t) => {
  const flagOption = new FlagOption('--test', ['-t'], 'Test flag option');

  await t.step('should always return valid result', () => {
    const result = flagOption.validate();
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(result.errorMessage, undefined);
  });
});
