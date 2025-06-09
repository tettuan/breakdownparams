import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { FlagOption } from '../../src/option-models/flag_option.ts';
import { ValueOption } from '../../src/option-models/value_option.ts';
import { UserVariableOption } from '../../src/option-models/user_variable_option.ts';
import { OptionType } from "../../src/types/option_type.ts";

Deno.test('ValueOption', async (t) => {
  const validator = (value: string) => ({
    isValid: value.length > 0,
    validatedParams: [value],
    errors: value.length === 0 ? ['test is required'] : [],
  });
  const option = new ValueOption('test', ['t'], true, 'Test option', validator);

  await t.step('should have correct type', () => {
    assert(option.type === OptionType.VALUE);
  });

  await t.step('should validate required option', () => {
    const result = option.validate('--test=');
    assert(!result.isValid);
    assert(result.errorMessage && result.errorMessage.includes('Value cannot be empty'));
  });

  await t.step('should validate value with custom validator', () => {
    const result = option.validate('--test=');
    assert(!result.isValid);

    const validResult = option.validate('--test=valid');
    assert(validResult.isValid);
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});

Deno.test('FlagOption', async (t) => {
  const option = new FlagOption('flag', ['f'], 'Flag option');

  await t.step('should have correct structure', () => {
    assert(option.type === OptionType.FLAG);
    assertEquals(option.isRequired, false);
    assertEquals(option.name, 'flag');
    assertEquals(option.aliases, ['f']);
    assertEquals(option.description, 'Flag option');
  });

  await t.step('should validate flag option structure', () => {
    const result = option.validate();
    assert(result.isValid);
  });

  await t.step('should get flag option value', () => {
    assertEquals(option.getValue(), true);
  });
});

Deno.test('UserVariableOption', async (t) => {
  const option = new UserVariableOption('--uv-test', 'Test variable');

  await t.step('should have correct type', () => {
    assert(option.type === OptionType.USER_VARIABLE);
  });

  await t.step('should validate name pattern', () => {
    const result = option.validate('--uv-test=value');
    assert(result.isValid);
  });

  await t.step('should reject invalid name pattern', () => {
    const result = option.validate('--uv-123=value');
    assert(!result.isValid);
  });

  await t.step('should parse value', () => {
    const value = option.parse('--uv-test=test');
    assertEquals(value, 'test');
  });
});
