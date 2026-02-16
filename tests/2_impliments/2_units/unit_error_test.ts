import { assert, assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type { OptionRule } from '../../../src/types/option_rule.ts';
import type { ErrorInfo } from '../../../src/types/params_result.ts';

const logger = new BreakdownLogger('parser');

Deno.test('test_validation_error', () => {
  /**
   * Test for error object structure and properties.
   *
   * Purpose: Validates that error objects contain the required properties
   * and maintain the correct structure for consistent error handling.
   *
   * Background: Error objects are fundamental to the application's error
   * handling system. They must contain message, code, and category fields
   * to ensure errors can be properly identified and processed.
   *
   * Intent: This test ensures that error objects conform to the ErrorInfo
   * interface, preventing runtime errors and maintaining type safety
   * throughout the error handling pipeline.
   */
  const error: ErrorInfo = {
    message: 'Test error',
    code: 'TEST_ERROR',
    category: 'test_category',
  };
  logger.debug('Error info structure', {
    data: { message: error.message, code: error.code, category: error.category },
  });
  assertEquals(error.message, 'Test error', 'Error message should match');
  assertEquals(error.code, 'TEST_ERROR', 'Error code should match');
  assertEquals(error.category, 'test_category', 'Error category should match');

  /**
   * Test for option rule configuration structure.
   *
   * Purpose: Validates the structure and properties of OptionRule objects
   * that define how command-line options are parsed and validated.
   *
   * Background: OptionRule objects configure the parser's behavior for
   * handling various command-line options, including format specifications,
   * validation rules, error handling strategies, and flag options.
   *
   * Intent: This test ensures that OptionRule objects maintain the expected
   * structure with all required properties properly typed. This is critical
   * for the parser to correctly process command-line arguments according to
   * the specified rules and handle edge cases appropriately.
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
