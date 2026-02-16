import { assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type { OptionRule } from '../../src/types/option_rule.ts';

const logger = new BreakdownLogger("option-validator");

Deno.test('test_option_rule_structure', () => {
  const rule: OptionRule = {
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

  /**
   * Test: Basic OptionRule structure
   *
   * Purpose:
   * Validates the top-level structure of OptionRule configuration object.
   *
   * Background:
   * OptionRule defines how command-line options are parsed and validated.
   * It must contain format specification, validation rules, error handling
   * policies, and flag option definitions.
   *
   * Intent:
   * - Verify all required properties exist
   * - Ensure each property has the correct type
   * - Validate the overall configuration structure
   */
  logger.debug("OptionRule construction", { data: { format: rule.format, userVariables: rule.rules.userVariables, flagOptions: rule.flagOptions } });
  assertEquals(typeof rule.format, 'string', 'format should be a string');
  assertEquals(typeof rule.rules, 'object', 'rules should be an object');
  assertEquals(typeof rule.errorHandling, 'object', 'errorHandling should be an object');
  assertEquals(typeof rule.flagOptions, 'object', 'flagOptions should be an object');

  /**
   * Test: Validation settings structure
   *
   * Purpose:
   * Validates the detailed structure of validation rules and error handling
   * configuration within OptionRule.
   *
   * Background:
   * The rules and errorHandling sections control how options are validated
   * and how errors are reported. Proper structure ensures consistent behavior.
   *
   * Intent:
   * - Verify userVariables is an array for pattern matching
   * - Ensure error handling policies are strings
   * - Validate requiredOptions and valueTypes are arrays
   * - Confirm all validation settings have correct types
   */
  assertEquals(
    Array.isArray(rule.rules.userVariables),
    true,
    'userVariables should be an array',
  );
  assertEquals(typeof rule.errorHandling.emptyValue, 'string', 'emptyValue should be a string');
  assertEquals(
    typeof rule.errorHandling.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof rule.errorHandling.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assertEquals(
    Array.isArray(rule.rules.requiredOptions),
    true,
    'requiredOptions should be an array',
  );
  assertEquals(Array.isArray(rule.rules.valueTypes), true, 'valueTypes should be an array');

  /**
   * Test: Flag options structure
   *
   * Purpose:
   * Validates the structure of flag options (boolean options without values).
   *
   * Background:
   * Flag options like --help and --version don't take values. They are
   * defined in flagOptions with boolean values indicating whether they
   * are recognized as valid flags.
   *
   * Intent:
   * - Verify flag option values are booleans
   * - Ensure common flags (help, version) are properly defined
   * - Validate the flagOptions object structure
   */
  assertEquals(typeof rule.flagOptions['help'], 'boolean', 'flag option value should be a boolean');
  assertEquals(
    typeof rule.flagOptions['version'],
    'boolean',
    'flag option value should be a boolean',
  );
});

Deno.test('test_option_rule_structure', async (t) => {
  await t.step('should have correct flag options structure', () => {
    const rule: OptionRule = {
      format: '--key=value',
      rules: {
        userVariables: ['uv-project', 'uv-version', 'uv-environment'],
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

    assertEquals(typeof rule.flagOptions, 'object');
    assertEquals(rule.flagOptions.help, true);
    assertEquals(rule.flagOptions.version, true);
  });
});
