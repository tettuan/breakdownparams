import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule } from '../../../src/types/option_rule.ts';
import { FlagOption } from '../../../src/option-models/flag_option.ts';
import { OptionType } from '../../../src/types/option_type.ts';

Deno.test('test_option_rule', () => {
  // オプションルールのテスト
  const optionRule: OptionRule = {
    format: '--key=value',
    rules: {
      customVariables: ['--demonstrative-type', '--layer-type'],
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
    Array.isArray(optionRule.rules.customVariables),
    true,
    'customVariables should be an array',
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
