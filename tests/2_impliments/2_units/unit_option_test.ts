import { assertEquals } from 'jsr:@std/assert@1';
import { OptionRule } from '../../../src/types/option_rule.ts';
import { FlagOption } from '../../../src/option-models/flag_option.ts';
import { OptionType } from '../../../src/types/option_type.ts';

Deno.test('test_option_rule', () => {
  /**
   * Test for option rule structure and validation.
   *
   * Purpose: Validates that OptionRule objects maintain the correct structure
   * and contain all required properties for parsing command-line options.
   *
   * Background: OptionRule defines how the parser should handle various
   * command-line options, including format specifications, validation rules,
   * error handling strategies, and flag options. This is a critical component
   * for consistent option parsing behavior.
   *
   * Intent: This test ensures that OptionRule objects are properly structured
   * with all required fields correctly typed. This prevents runtime errors
   * and ensures the parser can reliably process command-line arguments
   * according to the defined rules.
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
      'help': true,
      'version': true,
    },
  };

  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assertEquals(
    Array.isArray(optionRule.rules.userVariables),
    true,
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
  assertEquals(
    Array.isArray(optionRule.rules.requiredOptions),
    true,
    'requiredOptions should be an array',
  );
  assertEquals(
    Array.isArray(optionRule.rules.valueTypes),
    true,
    'valueTypes should be an array',
  );
  assertEquals(typeof optionRule.flagOptions, 'object', 'flagOptions should be an object');
});

Deno.test('test_flag_option_unit', async (t) => {
  const flagOption = new FlagOption('help', ['h'], 'Show help message');

  await t.step('should have correct type and properties', () => {
    assertEquals(flagOption.type, OptionType.FLAG);
    assertEquals(flagOption.isRequired, false);
    assertEquals(flagOption.name, 'help');
    assertEquals(flagOption.aliases, ['h']);
    assertEquals(flagOption.description, 'Show help message');
  });

  await t.step('should validate flag option correctly', () => {
    const result = flagOption.validate();
    assertEquals(result.isValid, true, 'Flag option should be valid when no value is provided');
    assertEquals(result.validatedParams, []);

    const resultWithValue = flagOption.validate();
    assertEquals(
      resultWithValue.isValid,
      true,
      'Flag option should be valid',
    );
  });

  await t.step('should get flag option values correctly', () => {
    assertEquals(
      flagOption.getValue(),
      true,
      'Flag option should return true when present',
    );
  });
});
