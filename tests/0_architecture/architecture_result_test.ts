import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import {
  ErrorInfo,
  OneParamResult,
  OptionRule,
  ParamsResult,
  TwoParamResult,
  ValidationResult,
  ZeroParamsResult,
} from '../../src/result/types.ts';
import { ParamsParser } from '../../src/parser/params_parser.ts';
import { DEFAULT_OPTION_RULE } from '../../src/parser/params_parser.ts';

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
  const parser = new ParamsParser(DEFAULT_OPTION_RULE);
  const result = parser.parse([]);
  assertEquals(result.type, 'zero');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
});

Deno.test('test_one_param_result_interface', () => {
  const parser = new ParamsParser(DEFAULT_OPTION_RULE);
  const result = parser.parse(['init']) as OneParamResult;
  assertEquals(result.type, 'one');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(typeof result.demonstrativeType, 'string');
});

Deno.test('test_two_param_result_interface', () => {
  const parser = new ParamsParser(DEFAULT_OPTION_RULE);
  const result = parser.parse(['to', 'project']) as TwoParamResult;
  assertEquals(result.type, 'two');
  assertEquals(Array.isArray(result.params), true);
  assertEquals(typeof result.options, 'object');
  assertEquals(typeof result.demonstrativeType, 'string');
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

Deno.test('test_option_rule_interface', () => {
  const rule: OptionRule = {
    format: '--key=value',
    validation: {
      customVariables: ['uv-project', 'uv-version', 'uv-environment'],
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
      requiredOptions: [],
      valueTypes: ['string'],
    },
    flagOptions: {
      help: 'help',
      version: 'version',
    },
    paramSpecificOptions: {
      zero: {
        allowedOptions: ['help', 'version'],
        requiredOptions: [],
      },
      one: {
        allowedOptions: ['help', 'version'],
        requiredOptions: [],
      },
      two: {
        allowedOptions: ['help', 'version'],
        requiredOptions: [],
      },
    },
  };
  assertEquals(typeof rule.format, 'string');
  assertEquals(typeof rule.validation, 'object');
  assertEquals(typeof rule.flagOptions, 'object');
});
