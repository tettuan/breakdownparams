import { assert, assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type { OptionRule } from '../../../src/types/option_rule.ts';
import type { ParamsResult } from '../../../src/types/params_result.ts';

const logger = new BreakdownLogger('parser');

Deno.test('test_params_parser', () => {
  /**
   * Test for parameter result object structure and initialization.
   *
   * Purpose: Validates that ParamsResult objects are correctly structured
   * and initialized with appropriate default values for the 'zero' type case.
   *
   * Background: The parser must return well-formed result objects even when
   * no parameters are provided. The 'zero' type represents commands that
   * contain only options or no arguments at all. This is a fundamental
   * edge case that must be handled correctly.
   *
   * Intent: This test ensures that ParamsResult objects for the 'zero' type
   * are properly initialized with empty parameter arrays, empty option objects,
   * and undefined error fields. This guarantees consistent behavior when
   * processing commands without positional arguments.
   */
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  logger.debug('Zero params result structure', {
    data: { type: result.type, params: result.params, hasError: result.error !== undefined },
  });
  assertEquals(result.type, 'zero', 'Result type should be zero');
  assertEquals(result.params, [], 'Params should be empty');
  assertEquals(result.options, {}, 'Options should be empty');
  assertEquals(result.error, undefined, 'Error should be undefined');

  /**
   * Test for option rule object structure and validation.
   *
   * Purpose: Validates the complete structure of OptionRule configuration
   * objects that control parser behavior for command-line options.
   *
   * Background: OptionRule objects encapsulate all configuration needed
   * for option parsing including format specifications, validation rules,
   * error handling policies, and flag option definitions. These rules
   * must be properly structured to ensure reliable parsing behavior.
   *
   * Intent: This test verifies that all required properties of OptionRule
   * are present and correctly typed. It ensures format is a string,
   * rule arrays are properly initialized, error handling strategies are
   * defined, and flag options are configured. This prevents configuration
   * errors that could lead to parsing failures.
   */
  const optionRule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      userVariables: ['--directive-type', '--layer-type'],
      requiredOptions: [],
      valueTypes: ['string'],
    },
    errorHandling: {
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
    },
  };

  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assert(
    Array.isArray(optionRule.rules.userVariables),
    'userVariables should be an array',
  );
  assertEquals(
    typeof optionRule.errorHandling.emptyValue,
    'string',
    'emptyValue should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assert(
    Array.isArray(optionRule.rules.requiredOptions),
    'requiredOptions should be an array',
  );
  assert(
    Array.isArray(optionRule.rules.valueTypes),
    'valueTypes should be an array',
  );
  assertEquals(typeof optionRule.flagOptions, 'object', 'flagOptions should be an object');
});
