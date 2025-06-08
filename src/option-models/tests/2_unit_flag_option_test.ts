import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../flag_option.ts';

Deno.test('FlagOption Unit Tests', async (t) => {
  const flagOption = new FlagOption('--test', ['-t'], 'Test flag option');

  await t.step('should handle flag absence correctly', () => {
    const result = flagOption.validate(undefined);
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(flagOption.parse(undefined), false);
  });

  await t.step('should handle empty input correctly', () => {
    const result = flagOption.validate('');
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(flagOption.parse(''), false);
  });

  await t.step('should reject flag with value', () => {
    const result = flagOption.validate('--test=value');
    assert(!result.isValid);
    assertEquals(result.validatedParams, []);
    assert(result.errorMessage?.includes('Invalid option format'));
  });

  await t.step('should reject flag with invalid format', () => {
    const result = flagOption.validate('invalid-format');
    assert(!result.isValid);
    assertEquals(result.validatedParams, []);
    assert(result.errorMessage?.includes('Invalid option format'));
  });
});
