import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule } from '../../../src/result/types.ts';
import { FlagOption } from '../../../src/options/flag_option.ts';
import { OptionType } from '../../../src/options/types.ts';

Deno.test('test_option_rule', () => {
  // オプションルールのテスト
  const optionRule: OptionRule = {
    format: '--key=value',
    validation: {
      customVariables: ['--demonstrative-type', '--layer-type'],
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
      requiredOptions: [],
      valueTypes: ['string'],
    },
    flagOptions: {
      'help': 'help',
      'version': 'version',
    },
  };

  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assertEquals(
    Array.isArray(optionRule.validation.customVariables),
    true,
    'customVariables should be an array',
  );
  assertEquals(typeof optionRule.validation.emptyValue, 'string', 'emptyValue should be a string');
  assertEquals(
    typeof optionRule.validation.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof optionRule.validation.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assertEquals(
    Array.isArray(optionRule.validation.requiredOptions),
    true,
    'requiredOptions should be an array',
  );
  assertEquals(
    Array.isArray(optionRule.validation.valueTypes),
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
    const result = flagOption.validate(undefined);
    assertEquals(result.isValid, true);
    assertEquals(result.validatedParams, []);

    const resultWithValue = flagOption.validate('true');
    assertEquals(resultWithValue.isValid, true);
    assertEquals(resultWithValue.validatedParams, []);
  });

  await t.step('should parse flag option values correctly', () => {
    assertEquals(flagOption.parse('true'), true);
    assertEquals(flagOption.parse(undefined), false);
    assertEquals(flagOption.parse('false'), false);
    assertEquals(flagOption.parse(''), false);
  });
});
