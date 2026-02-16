import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { FlagOption } from '../flag_option.ts';

const logger = new BreakdownLogger("option-model");

Deno.test('FlagOption Unit Tests', async (t) => {
  const flagOption = new FlagOption('--test', ['-t'], 'Test flag option');

  await t.step('should always return valid result', () => {
    const result = flagOption.validate();
    logger.debug("FlagOption validate result", { data: { isValid: result.isValid, validatedParams: result.validatedParams, errorMessage: result.errorMessage } });
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(result.errorMessage, undefined);
  });
});
