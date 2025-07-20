import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import {
  ErrorInfo,
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../../src/types/params_result.ts';
import { OptionRule } from '../../src/types/option_rule.ts';
import { ValidationResult } from '../../src/types/validation_result.ts';

Deno.test('test_params_result_interface', () => {
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
});

Deno.test('test_zero_params_result_interface', () => {
  const result: ZeroParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
});

Deno.test('test_one_param_result_interface', () => {
  const result: OneParamsResult = {
    type: 'one',
    params: [],
    options: {},
    directiveType: 'init',
  };
  assertEquals(result.type, 'one');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(typeof result.directiveType, 'string');
});

Deno.test('test_two_param_result_interface', () => {
  const result: TwoParamsResult = {
    type: 'two',
    params: [],
    options: {},
    directiveType: 'to',
    layerType: 'project',
  };
  assertEquals(result.type, 'two');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(typeof result.directiveType, 'string');
  assertEquals(typeof result.layerType, 'string');
});

Deno.test('test_error_info_interface', () => {
  const error: ErrorInfo = {
    message: 'Error message',
    code: 'ERROR_CODE',
    category: 'error_category',
  };
  assertEquals(typeof error.message, 'string');
  assertEquals(typeof error.code, 'string');
  assertEquals(typeof error.category, 'string');
});

Deno.test('test_validation_result_interface', () => {
  const result: ValidationResult = {
    isValid: true,
    validatedParams: [],
  };
  assertEquals(typeof result.isValid, 'boolean');
  assertEquals(Array.isArray(result.validatedParams), true);
});

Deno.test('test_option_rule_interface', async (t) => {
  const rule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      customVariables: ['uv-project', 'uv-version', 'uv-environment'],
      requiredOptions: [],
      valueTypes: ['string'],
    },
    errorHandling: {
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
    },
  };

  await t.step('should have correct flag options structure', () => {
    assertEquals(typeof rule.format, 'string');
    assertEquals(typeof rule.flagOptions, 'object');
    assertEquals(typeof rule.rules, 'object');
    assertEquals(typeof rule.errorHandling, 'object');
    assertEquals(typeof rule.flagOptions.help, 'boolean');
    assertEquals(typeof rule.flagOptions.version, 'boolean');
  });
});
