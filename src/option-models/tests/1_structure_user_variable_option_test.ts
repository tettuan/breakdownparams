import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { UserVariableOption } from '../user_variable_option.ts';
import { OptionType } from '../../types/option_type.ts';

const logger = new BreakdownLogger("option-model");

Deno.test('UserVariableOption Structure', async (t) => {
  const option = new UserVariableOption('--uv-test', 'Test variable');
  logger.debug("UserVariableOption created", { data: { name: option.name, type: option.type } });

  await t.step('should have correct type', () => {
    assert(option.type === OptionType.USER_VARIABLE);
  });

  await t.step('should validate name pattern', () => {
    const result = option.validate('--uv-test=value');
    logger.debug("UserVariableOption validation result", { data: { isValid: result.isValid, errorMessage: result.errorMessage } });
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
