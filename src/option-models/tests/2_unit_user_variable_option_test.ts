import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { UserVariableOption } from '../user_variable_option.ts';

const logger = new BreakdownLogger('option-model');

Deno.test('UserVariableOption Unit Tests', async (t) => {
  const userVariableOption = new UserVariableOption(
    '--uv-test',
    'Test user variable option',
  );

  await t.step('should handle valid user variable name correctly', () => {
    const result = userVariableOption.validate('--uv-test=value');
    logger.debug('UserVariableOption valid result', {
      data: { isValid: result.isValid, validatedParams: result.validatedParams },
    });
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(userVariableOption.parse('--uv-test=value'), 'value');
  });

  await t.step('should handle invalid pattern (starts with digit)', () => {
    const option = new UserVariableOption('--uv-1abc', 'desc');
    const result = option.validate('--uv-1abc=value');
    logger.debug('UserVariableOption invalid pattern result', {
      data: { isValid: result.isValid, errorMessage: result.errorMessage },
    });
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid variable name pattern'));
  });

  await t.step('should handle invalid pattern (contains hyphen)', () => {
    const option = new UserVariableOption('--uv-ab-c', 'desc');
    const result = option.validate('--uv-ab-c=value');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid variable name pattern'));
  });

  await t.step('should handle empty variable name', () => {
    const option = new UserVariableOption('--uv-', 'desc');
    const result = option.validate('--uv-=');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid variable name pattern'));
  });

  await t.step('should error if = is missing', () => {
    const result = userVariableOption.validate('--uv-test');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid value format'));
  });

  await t.step('should handle multiple = signs', () => {
    const result = userVariableOption.validate('--uv-test==val');
    assert(result.isValid);
    assertEquals(userVariableOption.parse('--uv-test==val'), '=val');
  });

  await t.step('should allow empty value', () => {
    const result = userVariableOption.validate('--uv-test=');
    assert(result.isValid);
    assertEquals(userVariableOption.parse('--uv-test='), '');
  });

  await t.step('should allow complex value', () => {
    const result = userVariableOption.validate('--uv-test={"key":"value"}');
    assert(result.isValid);
    assertEquals(userVariableOption.parse('--uv-test={"key":"value"}'), '{"key":"value"}');
  });

  await t.step('should distinguish case in variable name', () => {
    const option1 = new UserVariableOption('--uv-Project', 'desc');
    const option2 = new UserVariableOption('--uv-project', 'desc');
    const result1 = option1.validate('--uv-Project=foo');
    const result2 = option2.validate('--uv-project=bar');
    assert(result1.isValid);
    assert(result2.isValid);
    assertEquals(option1.parse('--uv-Project=foo'), 'foo');
    assertEquals(option2.parse('--uv-project=bar'), 'bar');
  });

  await t.step('should error on invalid syntax (no -- prefix)', () => {
    const option = new UserVariableOption('uv-test', 'desc');
    const result = option.validate('uv-test=value');
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Option must start with --'));
  });

  await t.step('should handle undefined value correctly', () => {
    const result = userVariableOption.validate(undefined);
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(userVariableOption.parse(undefined), undefined);
  });
});
