import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { OptionType } from '../../src/types/option.ts';

Deno.test('OptionType', async (t) => {
  await t.step('should have correct enum values', () => {
    assertEquals(OptionType.VALUE, 'VALUE');
    assertEquals(OptionType.FLAG, 'FLAG');
    assertEquals(OptionType.CUSTOM_VARIABLE, 'CUSTOM_VARIABLE');
  });
});
