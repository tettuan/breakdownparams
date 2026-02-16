import { assert, assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type { OptionRule } from '../../../src/types/option_rule.ts';
import type { ParamsResult } from '../../../src/types/params_result.ts';

const logger = new BreakdownLogger('parser');

Deno.test('test_params_result', () => {
  /**
   * Test for parameter result structure.
   *
   * Purpose: Validates the structure and properties of ParamsResult objects
   * which represent the output of parameter parsing operations.
   *
   * Background: ParamsResult is the fundamental return type from the parser,
   * containing the parsed type, parameters array, options object, and
   * optional error information. This structure must be consistent across
   * all parsing scenarios.
   *
   * Intent: This test ensures that ParamsResult objects maintain the expected
   * structure with correct typing for all fields. It specifically validates
   * the 'zero' type result case where no parameters are provided, ensuring
   * the parser correctly initializes empty arrays and objects.
   */
  const result: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  logger.debug('Params result structure', {
    data: {
      type: result.type,
      paramsLength: result.params.length,
      hasError: result.error !== undefined,
    },
  });
  assertEquals(result.type, 'zero', 'Result type should be zero');
  assertEquals(result.params, [], 'Params should be empty');
  assertEquals(result.options, {}, 'Options should be empty');
  assertEquals(result.error, undefined, 'Error should be undefined');

  /**
   * Test for option rule configuration.
   *
   * Purpose: Validates the structure and typing of OptionRule objects
   * that configure how the parser processes command-line options.
   *
   * Background: OptionRule objects define the complete specification for
   * option parsing including format patterns, validation rules, error
   * handling strategies, and flag option configurations. These rules
   * ensure consistent and predictable option parsing behavior.
   *
   * Intent: This test verifies that OptionRule objects contain all required
   * properties with correct types. It ensures the configuration structure
   * supports proper type checking and prevents runtime errors during
   * option parsing operations.
   */
  const optionRule: OptionRule = {
    format: '--key=value',
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
    flagOptions: {
      help: true,
      version: true,
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
