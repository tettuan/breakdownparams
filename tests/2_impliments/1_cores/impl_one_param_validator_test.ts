import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts';
import { OneParamValidator } from '../../../src/validator/one_param_validator.ts';
import { ParamsParser } from '../../../src/parser/params_parser.ts';
import { DEFAULT_OPTION_RULE } from '../../../src/parser/params_parser.ts';

Deno.test('test_one_param_validator', async (t) => {
  await t.step('should validate one parameter', () => {
    const validator = new OneParamValidator(DEFAULT_OPTION_RULE);
    const result = validator.validate(['init']);
    assertEquals(result.isValid, true);
  });

  await t.step('should reject invalid parameter', () => {
    const validator = new OneParamValidator(DEFAULT_OPTION_RULE);
    const result = validator.validate(['invalid']);
    assertEquals(result.isValid, false);
  });

  await t.step('should reject multiple parameters', () => {
    const validator = new OneParamValidator(DEFAULT_OPTION_RULE);
    const result = validator.validate(['init', 'extra']);
    assertEquals(result.isValid, false);
  });

  await t.step('should reject no parameters', () => {
    const validator = new OneParamValidator(DEFAULT_OPTION_RULE);
    const result = validator.validate([]);
    assertEquals(result.isValid, false);
  });
});

Deno.test('test_one_param_parser', async (t) => {
  await t.step('should parse one parameter', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['init']);
    assertEquals(result.type, 'one');
    assertEquals(result.params[0], 'init');
  });

  await t.step('should reject invalid parameter', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['invalid']);
    assertEquals(result.type, 'error');
  });

  await t.step('should reject multiple parameters', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['init', 'extra']);
    assertEquals(result.type, 'error');
  });

  await t.step('should reject no parameters', () => {
    const parser = new ParamsParser();
    const result = parser.parse([]);
    assertNotEquals(result.type, 'one');
  });
});
