import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { FlagOption } from '../../src/options/flag_option.ts';
import { OptionType } from '../../src/options/types.ts';

Deno.test('test_flag_option_properties', async (t) => {
  await t.step('should have correct type', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    assertEquals(flagOption.type, OptionType.FLAG);
  });
});

Deno.test('test_option_type_enum', () => {
  assertEquals(OptionType.VALUE, 0);
  assertEquals(OptionType.FLAG, 1);
  assertEquals(OptionType.CUSTOM_VARIABLE, 2);
});
