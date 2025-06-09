import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule } from '../../src/types/option_rule.ts';

Deno.test('test_option_rule_structure', () => {
  const rule: OptionRule = {
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
      help: true,
      version: true,
    },
  };

  // 基本構造のテスト
  assertEquals(typeof rule.format, 'string', 'format should be a string');
  assertEquals(typeof rule.rules, 'object', 'rules should be an object');
  assertEquals(typeof rule.errorHandling, 'object', 'errorHandling should be an object');
  assertEquals(typeof rule.flagOptions, 'object', 'flagOptions should be an object');

  // バリデーション設定のテスト
  assertEquals(
    Array.isArray(rule.rules.customVariables),
    true,
    'customVariables should be an array',
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

  // フラグオプションのテスト
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
        customVariables: ['uv-project', 'uv-version', 'uv-environment'],
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
