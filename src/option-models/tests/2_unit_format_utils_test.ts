import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import {
  parseOption,
  validateEmptyValue,
  validateLongFormOption,
  validateOptionFormat,
  validateShortFormOption,
  validateUserVariableOption,
} from '../format_utils.ts';

Deno.test('Format Utils Unit Tests', async (t) => {
  await t.step('should validate long form options', () => {
    assert(validateLongFormOption('--test=value'));
    assert(validateLongFormOption('--test'));
    assert(!validateLongFormOption('test'));
    assert(!validateLongFormOption('--test=value=invalid'));
  });

  await t.step('should validate short form options', () => {
    assert(validateShortFormOption('-t=value'));
    assert(validateShortFormOption('-t'));
    assert(!validateShortFormOption('t'));
    assert(!validateShortFormOption('-tt'));
  });

  await t.step('should validate empty values', () => {
    assert(validateEmptyValue(''));
    assert(validateEmptyValue('""'));
    assert(validateEmptyValue("''"));
    assert(validateEmptyValue(undefined));
    assert(!validateEmptyValue('value'));
  });

  await t.step('should validate user variable options', () => {
    assert(validateUserVariableOption('--uv-test=value'));
    assert(validateUserVariableOption('--uv-test'));
    assert(!validateUserVariableOption('--test'));
    assert(!validateUserVariableOption('uv-test'));
  });

  await t.step('should parse options correctly', () => {
    const result1 = parseOption('--test=value');
    assertEquals(result1.key, 'test');
    assertEquals(result1.value, 'value');

    const result2 = parseOption('--test');
    assertEquals(result2.key, 'test');
    assertEquals(result2.value, undefined);
  });

  await t.step('should validate option format', () => {
    const validResult = validateOptionFormat('--test=value');
    assert(validResult.isValid);
    assertEquals(validResult.error, undefined);

    const invalidResult = validateOptionFormat('test');
    assert(!invalidResult.isValid);
    assertEquals(invalidResult.error, 'Option must start with --');
  });
});
