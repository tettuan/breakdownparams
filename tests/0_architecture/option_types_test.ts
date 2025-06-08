import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { FlagOption } from '../../src/option-models/flag_option.ts';
import { OptionType } from "../../src/types/option_type.ts"';

Deno.test('test_flag_option_properties', async (t) => {
  await t.step('should have correct type', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    assertEquals(flagOption.type, OptionType.FLAG);
  });
});

Deno.test('test_option_type_enum', () => {
  assertEquals(OptionType.VALUE, 'value');
  assertEquals(OptionType.FLAG, 'flag');
  assertEquals(OptionType.CUSTOM_VARIABLE, 'custom_variable');
});
