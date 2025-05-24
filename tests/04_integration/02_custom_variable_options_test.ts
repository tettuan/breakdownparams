/**
 * Custom Variable Options Integration Test Suite
 *
 * Purpose of this test file:
 * 1. Test complex scenarios involving custom variable options
 * 2. Test interactions between custom variables and other features
 * 3. Test edge cases and combinations of different parameter types
 *
 * Expected behavior:
 * - Complex combinations of custom variables work correctly
 * - Custom variables interact correctly with other features
 * - Edge cases are handled appropriately
 *
 * Test case structure:
 * 1. Test complex combinations of custom variables
 * 2. Test interactions with other features
 * 3. Test edge cases
 */

import { assertEquals, assertExists } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../../mod.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('Custom Variable Options Integration', async (t) => {
  const parser = new ParamsParser();

  // Pre-processing and Preparing Part
  const _complexVarName = 'complex_name-123';
  const _complexVarValue = 'complex-value-456';
  const _specialVarName = 'special_name_789';
  const _specialVarValue = 'special-value_012';

  // Main Test
  await t.step('should handle complex combinations of custom variables', () => {
    _logger.debug('Testing complex combinations of custom variables');
    const result = parser.parse([
      'to',
      'project',
      '--uv-name',
      'value',
      '--uv-type',
      'test',
      '--uv-category',
      'feature',
      '--uv-priority',
      'high',
      '--uv-status',
      'in-progress',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        customVariables: {
          name: 'value',
          type: 'test',
          category: 'feature',
          priority: 'high',
          status: 'in-progress',
        },
      });
    }
  });

  await t.step('should handle custom variables with all other options', () => {
    _logger.debug('Testing custom variables with all other options');
    const result = parser.parse([
      'to',
      'project',
      '--from',
      'input.txt',
      '--destination',
      'output.txt',
      '--input',
      'issue',
      '--adaptation',
      'strict',
      '--config',
      'test',
      '--uv-name',
      'value',
      '--uv-type',
      'test',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
        fromLayerType: 'issue',
        adaptationType: 'strict',
        configFile: 'test',
        customVariables: {
          name: 'value',
          type: 'test',
        },
      });
    }
  });

  await t.step('should handle custom variables with extended mode', () => {
    _logger.debug('Testing custom variables with extended mode');
    const extendedParser = new ParamsParser({
      isExtendedMode: true,
      demonstrativeType: {
        pattern: '^[a-z]+$',
        errorMessage: 'Invalid demonstrative type',
      },
      layerType: {
        pattern: '^[a-z]+$',
        errorMessage: 'Invalid layer type',
      },
    });
    const result = extendedParser.parse([
      'custom',
      'layer',
      '--uv-name',
      'value',
      '--uv-type',
      'test',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'custom');
      assertEquals(result.layerType, 'layer');
      assertEquals(result.options, {
        customVariables: {
          name: 'value',
          type: 'test',
        },
      });
    }
  });

  await t.step('should handle custom variables with layer type aliases', () => {
    _logger.debug('Testing custom variables with layer type aliases');
    const result = parser.parse([
      'to',
      'pj',
      '--uv-name',
      'value',
      '--uv-type',
      'test',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        customVariables: {
          name: 'value',
          type: 'test',
        },
      });
    }
  });

  await t.step('should handle custom variables with different demonstrative types', () => {
    _logger.debug('Testing custom variables with different demonstrative types');
    const testCases = [
      { demonstrativeType: 'to', layerType: 'project' },
      { demonstrativeType: 'summary', layerType: 'issue' },
      { demonstrativeType: 'defect', layerType: 'task' },
    ];

    for (const { demonstrativeType, layerType } of testCases) {
      _logger.debug('Testing demonstrative type', { demonstrativeType, layerType });
      const result = parser.parse([
        demonstrativeType,
        layerType,
        '--uv-name',
        'value',
        '--uv-type',
        'test',
      ]);
      _logger.debug('Parse result', result);
      assertEquals(result.type, 'double');
      if (result.type === 'double') {
        assertEquals(result.demonstrativeType, demonstrativeType);
        assertEquals(result.layerType, layerType);
        assertEquals(result.options, {
          customVariables: {
            name: 'value',
            type: 'test',
          },
        });
      }
    }
  });

  await t.step('should handle custom variables with invalid demonstrative type', () => {
    _logger.debug('Testing custom variables with invalid demonstrative type');
    const result = parser.parse([
      'invalid',
      'project',
      '--uv-name',
      'value',
      '--uv-type',
      'test',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'INVALID_DEMONSTRATIVE_TYPE');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Invalid demonstrative type: invalid. Must be one of: to, summary, defect',
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, 'invalid');
      assertEquals(result.error.details.validTypes, ['to', 'summary', 'defect']);
    }
  });

  await t.step('should handle custom variables with invalid layer type', () => {
    _logger.debug('Testing custom variables with invalid layer type');
    const result = parser.parse([
      'to',
      'invalid',
      '--uv-name',
      'value',
      '--uv-type',
      'test',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'INVALID_LAYER_TYPE');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Invalid layer type: invalid. Must be one of: project, issue, task',
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, 'invalid');
      assertEquals(result.error.details.validTypes, ['project', 'issue', 'task']);
    }
  });

  await t.step('should handle custom variables with special characters in values', () => {
    _logger.debug('Testing custom variables with special characters in values');
    const result = parser.parse([
      'to',
      'project',
      '--uv-name',
      'value;with|special&chars',
      '--uv-type',
      'test',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'SECURITY_ERROR');
      assertEquals(result.error.category, 'SECURITY');
      assertEquals(
        result.error.message,
        "Security error: character ';' is not allowed in parameters",
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.forbiddenChar, ';');
      assertEquals(result.error.details.location, 'customVariableValue:name');
    }
  });

  await t.step('should handle custom variables with missing values', () => {
    _logger.debug('Testing custom variables with missing values');
    const result = parser.parse([
      'to',
      'project',
      '--uv-name',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'MISSING_VALUE_FOR_CUSTOM_VARIABLE');
      assertEquals(result.error.category, 'SYNTAX');
      assertEquals(result.error.message, 'Missing value for custom variable: --uv-name');
      assertExists(result.error.details);
      assertEquals(result.error.details.variable, '--uv-name');
    }
  });

  await t.step('should handle custom variables with invalid names', () => {
    _logger.debug('Testing custom variables with invalid names');
    const result = parser.parse([
      'to',
      'project',
      '--uv-',
      'value',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'INVALID_CUSTOM_VARIABLE_NAME');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(result.error.message, 'Invalid custom variable name: --uv-');
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, '--uv-');
    }
  });

  await t.step('should handle custom variables with duplicate names', () => {
    _logger.debug('Testing custom variables with duplicate names');
    const result = parser.parse([
      'to',
      'project',
      '--uv-name',
      'value1',
      '--uv-name',
      'value2',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        customVariables: {
          name: 'value2', // Last value should be used
        },
      });
    }
  });
});
