import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ZeroParamsParser } from '../../../src/core/params/processors/zero_params_parser.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../../../src/core/errors/constants.ts';

Deno.test('ZeroParamsParser - help flag', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--help']);
  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, true);
  assertEquals(result.data?.version, false);
  assertEquals(result.error, undefined);
});

Deno.test('ZeroParamsParser - version flag', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--version']);
  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, true);
  assertEquals(result.error, undefined);
});

Deno.test('ZeroParamsParser - short help flag', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['-h']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, true);
  assertEquals(result.data?.version, false);
  assertEquals(result.error, undefined);
});

Deno.test('ZeroParamsParser - short version flag', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['-v']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, true);
  assertEquals(result.error, undefined);
});

Deno.test('ZeroParamsParser - multiple flags', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--help', '--version']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, true);
  assertEquals(result.data?.version, true);
  assertEquals(result.error, undefined);
});

Deno.test('ZeroParamsParser - custom variable with security error', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test;ls']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - unknown option', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--unknown']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - valid custom variable', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test=value']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - empty args', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate([]);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, true);
  assertEquals(result.data?.version, false);
  assertEquals(result.error, undefined);
});

// 追加のテストケース
Deno.test('ZeroParamsParser - multiple custom variables', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test1=value1', '--uv-test2=value2']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - custom variable with empty value', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test=']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - custom variable with whitespace value', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test=   ']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - custom variable with special characters', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test=value@123']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - custom variable with unicode characters', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test=値']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - custom variable with invalid name', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test@name=value']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});

Deno.test('ZeroParamsParser - custom variable with invalid format', () => {
  const parser = new ZeroParamsParser(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
  const result = parser.validate(['--uv-test=value']);

  assertEquals(result.data?.type, 'zero');
  assertEquals(result.data?.help, false);
  assertEquals(result.data?.version, false);
  assertExists(result.error);
  assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
});
