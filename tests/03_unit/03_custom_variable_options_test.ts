/**
 * Custom Variable Options Test Suite
 *
 * Purpose of this test file:
 * 1. Verify that custom variable options (--uv-*) are handled correctly
 * 2. Validate that custom variables are only available with DoubleParams
 * 3. Confirm that custom variable names follow the specified rules
 * 4. Confirm that custom variable values are preserved as-is
 * 5. Verify error handling for invalid custom variable syntax
 *
 * Expected behavior:
 * - Custom variables are only valid with DoubleParams
 * - Custom variable names must follow the specified format (alphanumeric + minimal special chars)
 * - Custom variable values are preserved exactly as provided
 * - Multiple custom variables can be specified
 * - Invalid custom variable syntax results in appropriate errors
 *
 * Test case structure:
 * 1. Test basic custom variable functionality
 * 2. Test custom variable name validation
 * 3. Test custom variable value handling
 * 4. Test multiple custom variables
 * 5. Test error cases
 *
 * Notes:
 * - Custom variables are case-sensitive
 * - Custom variables are only available with DoubleParams
 * - Custom variables must use the --uv- prefix
 * - Custom variables must have a value (--uv-name=value format)
 */

import { assertEquals, assertExists } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../../mod.ts';

// Initialize logger for testing
const logger = new BreakdownLogger();

Deno.test('Custom Variable Options', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle basic custom variable', () => {
    logger.debug('Testing basic custom variable', { testName: 'basic_custom_variable' });
    const result = parser.parse([
      'to',
      'project',
      '--uv-project=myproject',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double' && result.options) {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options.customVariables, {
        'project': 'myproject',
      });
    }
  });

  await t.step('should handle multiple custom variables', () => {
    logger.debug('Testing multiple custom variables', { testName: 'multiple_custom_variables' });
    const result = parser.parse([
      'to',
      'project',
      '--uv-project=myproject',
      '--uv-version=1.0.0',
      '--uv-environment=production',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double' && result.options) {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options.customVariables, {
        'project': 'myproject',
        'version': '1.0.0',
        'environment': 'production',
      });
    }
  });

  await t.step('should preserve case sensitivity in custom variable names', () => {
    logger.debug('Testing case sensitivity', { testName: 'case_sensitivity' });
    const result = parser.parse([
      'to',
      'project',
      '--uv-Project=myproject',
      '--uv-project=otherproject',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double' && result.options) {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options.customVariables, {
        'Project': 'myproject',
        'project': 'otherproject',
      });
    }
  });

  await t.step('should handle complex custom variable values', () => {
    logger.debug('Testing complex values', { testName: 'complex_values' });
    const result = parser.parse([
      'to',
      'project',
      '--uv-path=/usr/local/bin',
      '--uv-config={"key":"value"}',
      '--uv-array=[1,2,3]',
    ]);
    logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'SECURITY_ERROR');
      assertEquals(result.error.category, 'SECURITY');
      assertEquals(
        result.error.message,
        "Security error: character '/' is not allowed in parameters",
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.forbiddenChar, '/');
      assertEquals(result.error.details.location, 'customVariableValue:path');
    }
  });

  await t.step('should ignore custom variables in NoParams', () => {
    logger.debug('Testing NoParams with custom variables', { testName: 'no_params' });
    const result = parser.parse([
      '--uv-project=myproject',
    ]);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, false);
      assertEquals(result.version, false);
    }
  });

  await t.step('should ignore custom variables in SingleParam', () => {
    logger.debug('Testing SingleParam with custom variables', { testName: 'single_param' });
    const result = parser.parse([
      'init',
      '--uv-project=myproject',
    ]);
    assertEquals(result.type, 'single');
    if (result.type === 'single') {
      assertEquals(result.command, 'init');
      assertEquals(result.options, {});
    }
  });

  await t.step('should handle custom variables with standard options', () => {
    logger.debug('Testing custom variables with standard options', {
      testName: 'with_standard_options',
    });
    const result = parser.parse([
      'to',
      'project',
      '--from=input.txt',
      '--destination=output.txt',
      '--uv-project=myproject',
      '--uv-version=1.0.0',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double' && result.options) {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
        customVariables: {
          'project': 'myproject',
          'version': '1.0.0',
        },
      });
    }
  });

  await t.step('should handle empty custom variable values', () => {
    logger.debug('Testing empty values', { testName: 'empty_values' });
    const result = parser.parse([
      'to',
      'project',
      '--uv-empty=',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double' && result.options) {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options.customVariables, {
        'empty': '',
      });
    }
  });
});
