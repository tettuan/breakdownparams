import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../flag_option.ts';
import { OptionType } from '../../types/option_type.ts';

Deno.test('FlagOption Structure', async (t) => {
  const option = new FlagOption('--flag', ['-f'], 'Flag option');

  await t.step('should have correct structure', () => {
    assert(option.type === OptionType.FLAG);
    assertEquals(option.isRequired, false);
    assertEquals(option.name, '--flag');
    assertEquals(option.aliases, ['-f']);
    assertEquals(option.description, 'Flag option');
  });

  await t.step('should validate flag option structure', () => {
    const result = option.validate('');
    assertEquals(result.errorMessage, undefined);
  });

  await t.step('should parse flag option value', () => {
    assertEquals(option.parse(''), false);
    assertEquals(option.parse(undefined), false);
    assertEquals(option.parse('--flag'), true);
    assertEquals(option.parse('-f'), true);
  });
});
