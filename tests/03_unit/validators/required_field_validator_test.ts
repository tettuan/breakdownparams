import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { RequiredFieldValidator } from '../../../src/validators/required_field_validator.ts';
import { ErrorCategory, ErrorCode } from '../../../src/core/errors/types.ts';

Deno.test('RequiredFieldValidator - valid non-empty string', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['test']);

  assertEquals(result.success, true);
});

Deno.test('RequiredFieldValidator - valid non-empty number', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['123']);

  assertEquals(result.success, true);
});

Deno.test('RequiredFieldValidator - valid non-empty boolean', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['true']);

  assertEquals(result.success, true);
});

Deno.test('RequiredFieldValidator - valid non-empty object', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['{"key":"value"}']);

  assertEquals(result.success, true);
});

Deno.test('RequiredFieldValidator - valid non-empty array', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['[1,2,3]']);

  assertEquals(result.success, true);
});

Deno.test('RequiredFieldValidator - invalid empty string', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['']);

  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
  assertEquals(result.error.message, 'field is required');
});

Deno.test('RequiredFieldValidator - invalid whitespace string', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['   ']);

  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
  assertEquals(result.error.message, 'field is required');
});

Deno.test('RequiredFieldValidator - invalid empty object', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['{}']);

  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
  assertEquals(result.error.message, 'field is required');
});

Deno.test('RequiredFieldValidator - invalid empty array', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['[]']);

  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.error.category, ErrorCategory.VALIDATION);
  assertEquals(result.error.message, 'field is required');
});

Deno.test('RequiredFieldValidator - invalid zero', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['0']);

  assertEquals(result.success, true);
});

Deno.test('RequiredFieldValidator - invalid false', () => {
  const validator = new RequiredFieldValidator('field');
  const result = validator.validate(['false']);

  assertEquals(result.success, true);
});
