import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { OptionType } from '../option_type.ts';
import type { ValidationResult } from '../validation_result.ts';
import type { ParamsResult } from '../params_result.ts';
import type { OptionRule } from '../option_rule.ts';
import type { CustomConfig } from '../custom_config.ts';

// 1. Basic type definition design verification
Deno.test('test_type_definitions_design', async (t) => {
  await t.step('should maintain option type enum', () => {
    assertEquals(OptionType.VALUE, 'value');
    assertEquals(OptionType.FLAG, 'flag');
    assertEquals(OptionType.USER_VARIABLE, 'user_variable');
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

// 2. Type consistency verification
Deno.test('test_type_consistency', async (t) => {
  await t.step('should maintain consistent option type values', () => {
    const valueType = OptionType.VALUE;
    const flagType = OptionType.FLAG;
    const userVarType = OptionType.USER_VARIABLE;

    assertEquals(typeof valueType, 'string');
    assertEquals(typeof flagType, 'string');
    assertEquals(typeof userVarType, 'string');
    assertEquals(valueType, 'value');
    assertEquals(flagType, 'flag');
    assertEquals(userVarType, 'user_variable');
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

// 3. Type safety verification
Deno.test('test_type_safety', async (t) => {
  await t.step('should enforce option type constraints', () => {
    const valueType = OptionType.VALUE;
    const flagType = OptionType.FLAG;
    const userVarType = OptionType.USER_VARIABLE;

    assertEquals(valueType, 'value');
    assertEquals(flagType, 'flag');
    assertEquals(userVarType, 'user_variable');
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
    assert(
      result.type === 'zero' || result.type === 'one' || result.type === 'two' ||
        result.type === 'error',
    );
    assert(Array.isArray(result.params));
    assert(typeof result.options === 'object');
  });
});

// 4. Option rule tests
Deno.test('test_option_rule_structure', () => {
  const rule: OptionRule = {
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

  assertEquals(typeof rule.format, 'string', 'format should be a string');
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
  assertEquals(
    Array.isArray(rule.rules.valueTypes),
    true,
    'valueTypes should be an array',
  );
  assertEquals(typeof rule.flagOptions, 'object', 'flagOptions should be an object');
});

// 5. Custom configuration tests
Deno.test('test_custom_config_structure', () => {
  const config: CustomConfig = {
    params: {
      two: {
        directiveType: {
          pattern: '^(to|summary|defect)$',
          errorMessage: 'Invalid directive type. Must be one of: to, summary, defect',
        },
        layerType: {
          pattern: '^(project|issue|task)$',
          errorMessage: 'Invalid layer type. Must be one of: project, issue, task',
        },
      },
    },
    options: {
      flags: {
        help: {
          shortForm: 'h',
          description: 'Display help information',
        },
      },
      values: {
        from: {
          description: 'Source file path',
          valueRequired: true,
        },
      },
      userVariables: {
        pattern: '^uv-[a-zA-Z][a-zA-Z0-9_-]*$',
        description: 'User-defined variables (--uv-*)',
      },
    },
    validation: {
      zero: {
        allowedOptions: ['help', 'version'],
        allowedValueOptions: [],
        allowUserVariables: false,
      },
      one: {
        allowedOptions: ['config'],
        allowedValueOptions: ['from', 'destination'],
        allowUserVariables: false,
      },
      two: {
        allowedOptions: ['from', 'destination', 'config'],
        allowedValueOptions: ['from', 'destination', 'config'],
        allowUserVariables: true,
      },
    },
    errorHandling: {
      unknownOption: 'error',
      duplicateOption: 'error',
      emptyValue: 'error',
    },
  };

  assertEquals(typeof config.params, 'object', 'params should be an object');
  assertEquals(typeof config.params.two, 'object', 'params.two should be an object');
  assertEquals(
    typeof config.params.two.directiveType,
    'object',
    'directiveType should be an object',
  );
  assertEquals(typeof config.params.two.layerType, 'object', 'layerType should be an object');
  assertEquals(
    typeof config.params.two.directiveType?.pattern,
    'string',
    'directiveType.pattern should be string',
  );
  assertEquals(
    typeof config.params.two.directiveType?.errorMessage,
    'string',
    'directiveType.errorMessage should be string',
  );
  assertEquals(
    typeof config.params.two.layerType?.pattern,
    'string',
    'layerType.pattern should be string',
  );
  assertEquals(
    typeof config.params.two.layerType?.errorMessage,
    'string',
    'layerType.errorMessage should be string',
  );
  assertEquals(typeof config.options, 'object', 'options should be an object');
  assertEquals(typeof config.validation, 'object', 'validation should be an object');
  assertEquals(typeof config.errorHandling, 'object', 'errorHandling should be an object');
});
