import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ValueOption } from '../value_option.ts';
import { OptionType } from '../../types/option_type.ts';

const logger = new BreakdownLogger("option-model");

Deno.test('ValueOption Structure', async (t) => {
  const validator = (value: string) => ({
    isValid: value.length > 0,
    validatedParams: [value],
    errorMessage: value.length === 0 ? 'Value cannot be empty' : undefined,
  });
  const option = new ValueOption('--test', ['-t'], true, 'Test option', validator);

  await t.step('should have correct type', () => {
    assert(option.type === OptionType.VALUE);
  });

  await t.step('should validate required option', () => {
    const result = option.validate('');
    assert(!result.isValid);
    assert(result.errorMessage === 'Value cannot be empty');
  });

  await t.step('should validate value with custom validator', () => {
    const result = option.validate('');
    logger.debug('ValueOption validation result:', {
      isValid: result.isValid,
      errorMessage: result.errorMessage,
      validatedParams: result.validatedParams,
    });
    assert(!result.isValid);
    assert(result.errorMessage === 'Value cannot be empty');

    const validResult = option.validate('valid');
    logger.debug('ValueOption valid result:', {
      isValid: validResult.isValid,
      errorMessage: validResult.errorMessage,
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
