import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { UserVariableOptionValidator } from '../user_variable_option_validator.ts';

const logger = new BreakdownLogger('option-validator');

Deno.test('UserVariableOptionValidator Unit Tests', async (t) => {
  const validator = new UserVariableOptionValidator();

  await t.step('should handle valid user variable name correctly', () => {
    const result = validator.validate('--uv-test=value');
    logger.debug('Valid user variable result', {
      data: { isValid: result.isValid, validatedParams: result.validatedParams },
    });
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(validator.parse('--uv-test=value'), 'value');
  });

  await t.step('should handle invalid pattern (starts with digit)', () => {
    const result = validator.validate('--uv-1abc=value');
    logger.debug('Invalid pattern result', {
      data: { isValid: result.isValid, errorMessage: result.errorMessage },
    });
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid variable name pattern'));
  });

  await t.step('should handle invalid pattern (contains hyphen)', () => {
    const result = validator.validate('--uv-ab-c=value');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid variable name pattern'));
  });

  await t.step('should handle empty variable name', () => {
    const result = validator.validate('--uv-=');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid variable name pattern'));
  });

  await t.step('should error if = is missing', () => {
    const result = validator.validate('--uv-test');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid value format'));
  });

  await t.step('should handle multiple = signs', () => {
    const result = validator.validate('--uv-test==val');
    assert(result.isValid);
    assertEquals(validator.parse('--uv-test==val'), '=val');
  });

  await t.step('should allow empty value', () => {
    const result = validator.validate('--uv-test=');
    assert(result.isValid);
    assertEquals(validator.parse('--uv-test='), '');
  });

  await t.step('should allow complex value', () => {
    const result = validator.validate('--uv-test={"key":"value"}');
    assert(result.isValid);
    assertEquals(validator.parse('--uv-test={"key":"value"}'), '{"key":"value"}');
  });

  await t.step('should distinguish case in variable name', () => {
    const result1 = validator.validate('--uv-Project=foo');
    const result2 = validator.validate('--uv-project=bar');
    assert(result1.isValid);
    assert(result2.isValid);
    assertEquals(validator.parse('--uv-Project=foo'), 'foo');
    assertEquals(validator.parse('--uv-project=bar'), 'bar');
  });

  await t.step('should error on invalid syntax (no -- prefix)', () => {
    const result = validator.validate('uv-test=value');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Option must start with --uv-'));
  });

  await t.step('should handle undefined value correctly', () => {
    const result = validator.validate(undefined);
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(validator.parse(undefined), undefined);
  });
});
