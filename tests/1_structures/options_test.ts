import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { CustomVariableOption, FlagOption, ValueOption } from '../../src/options/base.ts';
import { OptionType } from '../../src/types/option.ts';

Deno.test('ValueOption', async (t) => {
  const validator = (value: string) => ({
    isValid: value.length > 0,
    errors: value.length === 0 ? ['Value cannot be empty'] : [],
  });

  const option = new ValueOption('test', ['t'], true, 'Test option', validator);

  await t.step('should have correct type', () => {
    assertEquals(option.type, OptionType.VALUE);
  });

  await t.step('should validate required option', () => {
    const result = option.validate(undefined);
    assert(!result.isValid);
    assert(result.errors.includes('test is required'));
  });

  await t.step('should validate value with custom validator', () => {
    const result = option.validate('');
    assert(!result.isValid);
    assert(result.errors.includes('Value cannot be empty'));

    const validResult = option.validate('valid');
    assert(validResult.isValid);
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});

Deno.test('FlagOption', async (t) => {
  const option = new FlagOption('test', ['t'], 'Test flag');

  await t.step('should have correct type', () => {
    assertEquals(option.type, OptionType.FLAG);
  });

  await t.step('should always validate successfully', () => {
    const result = option.validate(undefined);
    assert(result.isValid);
  });

  await t.step('should parse as boolean', () => {
    const trueValue = option.parse('any');
    assert(trueValue === true);

    const falseValue = option.parse(undefined);
    assert(falseValue === false);
  });
});

Deno.test('CustomVariableOption', async (t) => {
  const pattern = /^uv-[a-zA-Z0-9_]+$/;
  const option = new CustomVariableOption('uv-test', 'Test variable', pattern);

  await t.step('should have correct type', () => {
    assertEquals(option.type, OptionType.CUSTOM_VARIABLE);
  });

  await t.step('should validate name pattern', () => {
    const result = option.validate('value');
    assert(result.isValid);
  });

  await t.step('should reject invalid name pattern', () => {
    const invalidOption = new CustomVariableOption('invalid', 'Invalid', pattern);
    const result = invalidOption.validate('value');
    assert(!result.isValid);
    assert(result.errors.includes('Invalid custom variable name: invalid'));
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});
