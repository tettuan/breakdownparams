import { assert, assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRegistry } from '../../../src/options/option_registry.ts';
import { ValueOption } from '../../../src/options/value_option.ts';
import { FlagOption } from '../../../src/options/flag_option.ts';
import { CustomVariableOption } from '../../../src/options/custom_variable_option.ts';
import { ValidationResult } from '../../../src/result/types.ts';

Deno.test('test_option_registry', async (t) => {
  const registry = new OptionRegistry();

  await t.step('should register and retrieve value option', () => {
    const option = new ValueOption(
      'test',
      ['t'],
      false,
      'Test option',
      (v: string): ValidationResult => ({
        isValid: true,
        validatedParams: [],
        errorMessage: v.length === 0 ? 'Value cannot be empty' : undefined,
      }),
    );
    registry.register(option);

    const retrieved = registry.get('test');
    assertEquals(retrieved, option, 'Should retrieve registered option');

    const alias = registry.get('t');
    assertEquals(alias, option, 'Should retrieve option by alias');
  });

  await t.step('should register and retrieve flag option', () => {
    const option = new FlagOption(
      'help',
      ['h'],
      'Show help information',
    );
    registry.register(option);

    const retrieved = registry.get('help');
    assertEquals(retrieved, option, 'Should retrieve registered flag option');

    const alias = registry.get('h');
    assertEquals(alias, option, 'Should retrieve flag option by alias');
  });

  await t.step('should register and retrieve custom variable option', () => {
    const option = new CustomVariableOption(
      'uv-project',
      'Project name',
      /^uv-[a-zA-Z0-9_]+$/,
    );
    registry.register(option);

    const retrieved = registry.get('uv-project');
    assertEquals(retrieved, option, 'Should retrieve registered custom variable option');
  });

  await t.step('should validate custom variables', () => {
    assert(registry.validateCustomVariable('uv-test'));
    assert(!registry.validateCustomVariable('invalid'));
  });

  await t.step('should get all registered options', () => {
    const options = registry.getAll();
    assert(options.length > 0);
  });
});

Deno.test('test_value_option', async (t) => {
  const validator = (value: string): ValidationResult => ({
    isValid: value.length > 0,
    validatedParams: [],
    errorMessage: value.length === 0 ? 'Value cannot be empty' : undefined,
  });

  const option = new ValueOption('test', ['t'], true, 'Test option', validator);

  await t.step('should validate required option', () => {
    const result = option.validate(undefined);
    assert(!result.isValid);
    assert(result.errorMessage?.includes('test is required'));
  });

  await t.step('should validate value with custom validator', () => {
    const result = option.validate('');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Value cannot be empty'));

    const validResult = option.validate('valid');
    assert(validResult.isValid);
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});

Deno.test('test_flag_option', async (t) => {
  const option = new FlagOption('test', ['t'], 'Test flag');

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

Deno.test('test_custom_variable_option', async (t) => {
  const pattern = /^uv-[a-zA-Z0-9_]+$/;
  const option = new CustomVariableOption('uv-test', 'Test variable', pattern);

  await t.step('should validate name pattern', () => {
    const result = option.validate('value');
    assert(result.isValid);
  });

  await t.step('should reject invalid name pattern', () => {
    const invalidOption = new CustomVariableOption('invalid', 'Invalid', pattern);
    const result = invalidOption.validate('value');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid custom variable name: invalid'));
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});
