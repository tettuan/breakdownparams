import { assertEquals, assert } from 'jsr:@std/assert@^0.218.2';
import { OptionType } from '../option_type.ts';
import { ValidationResult } from '../validation_result.ts';
import { ParamsResult } from '../params_result.ts';
import { OptionRule } from '../option_rule.ts';
import { TwoParamsConfig } from '../params_config.ts';

// 1. 型定義の基本設計確認
Deno.test('test_type_definitions_design', async (t) => {
  await t.step('should maintain option type enum', () => {
    assertEquals(OptionType.VALUE, 'value');
    assertEquals(OptionType.FLAG, 'flag');
    assertEquals(OptionType.CUSTOM_VARIABLE, 'custom_variable');
  });

  await t.step('should maintain validation result type', () => {
    const result: ValidationResult = {
      isValid: true,
      validatedParams: [],
    };
    assert('isValid' in result);
    assert('validatedParams' in result);
    assertEquals(Array.isArray(result.validatedParams), true);
  });

  await t.step('should maintain params result type', () => {
    const result: ParamsResult = {
      type: 'zero',
      params: [],
      options: {},
    };
    assert('type' in result);
    assert('params' in result);
    assert('options' in result);
    assertEquals(typeof result.options, 'object');
  });
});

// 2. 型の一貫性確認
Deno.test('test_type_consistency', async (t) => {
  await t.step('should maintain consistent option type values', () => {
    const valueType = OptionType.VALUE;
    const flagType = OptionType.FLAG;
    const customVarType = OptionType.CUSTOM_VARIABLE;

    assertEquals(typeof valueType, 'string');
    assertEquals(typeof flagType, 'string');
    assertEquals(typeof customVarType, 'string');
    assertEquals(valueType, 'value');
    assertEquals(flagType, 'flag');
    assertEquals(customVarType, 'custom_variable');
  });

  await t.step('should maintain consistent validation result structure', () => {
    const result: ValidationResult = {
      isValid: true,
      validatedParams: [],
    };
    assertEquals(typeof result.isValid, 'boolean');
    assertEquals(Array.isArray(result.validatedParams), true);
  });

  await t.step('should maintain consistent params result structure', () => {
    const result: ParamsResult = {
      type: 'zero',
      params: [],
      options: {},
    };
    assertEquals(typeof result.type, 'string');
    assertEquals(Array.isArray(result.params), true);
    assertEquals(typeof result.options, 'object');
  });
});

// 3. 型の安全性確認
Deno.test('test_type_safety', async (t) => {
  await t.step('should enforce option type constraints', () => {
    const valueType = OptionType.VALUE;
    const flagType = OptionType.FLAG;
    const customVarType = OptionType.CUSTOM_VARIABLE;

    assertEquals(valueType, 'value');
    assertEquals(flagType, 'flag');
    assertEquals(customVarType, 'custom_variable');
  });

  await t.step('should enforce validation result constraints', () => {
    const result: ValidationResult = {
      isValid: true,
      validatedParams: [],
    };
    assert(result.isValid === true || result.isValid === false);
    assert(Array.isArray(result.validatedParams));
  });

  await t.step('should enforce params result constraints', () => {
    const result: ParamsResult = {
      type: 'zero',
      params: [],
      options: {},
    };
    assert(result.type === 'zero' || result.type === 'one' || result.type === 'two' || result.type === 'error');
    assert(Array.isArray(result.params));
    assert(typeof result.options === 'object');
  });
});

// 4. オプションルールのテスト
Deno.test('test_option_rule_structure', () => {
  const rule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: 'help',
      version: 'version',
    },
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
  };

  assertEquals(typeof rule.format, 'string', 'format should be a string');
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
  assertEquals(
    Array.isArray(rule.rules.valueTypes),
    true,
    'valueTypes should be an array',
  );
  assertEquals(typeof rule.flagOptions, 'object', 'flagOptions should be an object');
});

// 5. パラメータ設定のテスト
Deno.test('test_params_config_structure', () => {
  const config: TwoParamsConfig = {
    demonstrativeType: {
      pattern: '^(to|summary|defect)$',
      errorMessage: 'Invalid demonstrative type. Must be one of: to, summary, defect',
    },
    layerType: {
      pattern: '^(project|issue|task)$',
      errorMessage: 'Invalid layer type. Must be one of: project, issue, task',
    },
  };

  assertEquals(typeof config.demonstrativeType, 'object', 'demonstrativeType should be an object');
  assertEquals(typeof config.layerType, 'object', 'layerType should be an object');
  assertEquals(typeof config.demonstrativeType?.pattern, 'string', 'demonstrativeType.pattern should be string');
  assertEquals(typeof config.demonstrativeType?.errorMessage, 'string', 'demonstrativeType.errorMessage should be string');
  assertEquals(typeof config.layerType?.pattern, 'string', 'layerType.pattern should be string');
  assertEquals(typeof config.layerType?.errorMessage, 'string', 'layerType.errorMessage should be string');
}); 