import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { UserVariableOption } from '../user_variable_option.ts';
import { OptionType } from '../../types/option_type.ts';

Deno.test('UserVariableOption Structure', async (t) => {
  const option = new UserVariableOption('--uv-test', 'Test variable');

  await t.step('should have correct type', () => {
    assert(option.type === OptionType.USER_VARIABLE);
  });

  await t.step('should validate name pattern', () => {
    const result = option.validate('--uv-test=value');
    assertEquals(result.errorMessage, undefined);
  });

  await t.step('should reject invalid name pattern', () => {
    const invalidOption = new UserVariableOption('invalid', 'Invalid');
    const result = invalidOption.validate('invalid');
    assert(result.errorMessage === 'Option must start with --uv-');
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});
