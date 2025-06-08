import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { CustomVariableOption, FlagOption, ValueOption } from '../../src/options/base.ts';
import { OptionType } from '../../src/options/types.ts';

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
    const result = option.validate('');
    assert(result.errors && result.errors.includes('test is required'));
  });

  await t.step('should validate value with custom validator', () => {
    const result = option.validate('');
    console.log('ValueOption validation result:', {
      isValid: result.isValid,
      errors: result.errors,
      validatedParams: result.validatedParams,
    });
    assert(!result.isValid);
    assert(result.errors && result.errors.includes('test is required'));

    const validResult = option.validate('valid');
    console.log('ValueOption valid result:', {
      isValid: validResult.isValid,
      errors: validResult.errors,
      validatedParams: validResult.validatedParams,
    });
    assert(validResult.isValid);
    assert(validResult.validatedParams.includes('valid'));
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
    const result = option.validate('');
    assertEquals(result.errors, []);
  });

  await t.step('should parse flag option value', () => {
    assertEquals(option.parse(''), true);
  });
});

Deno.test('CustomVariableOption', async (t) => {
  const pattern = /^uv-[a-zA-Z0-9_]+$/;
  const option = new CustomVariableOption('uv-test', [], 'Test variable', pattern);

  await t.step('should have correct type', () => {
    assert(option.type === OptionType.CUSTOM_VARIABLE);
  });

  await t.step('should validate name pattern', () => {
    const result = option.validate('uv-test');
    assertEquals(result.errors, []);
  });

  await t.step('should reject invalid name pattern', () => {
    const invalidOption = new CustomVariableOption('invalid', [], 'Invalid', pattern);
    const result = invalidOption.validate('invalid');
    assert(result.errors && result.errors.includes('Invalid custom variable name: invalid'));
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});
