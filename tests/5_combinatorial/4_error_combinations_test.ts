/**
 * Combinatorial Test: Error Combinations Test
 *
 * Purpose:
 * This test file comprehensively validates error handling scenarios when multiple
 * error conditions occur simultaneously. It ensures that the parser provides
 * consistent, predictable error reporting with proper prioritization when faced
 * with complex invalid input combinations.
 *
 * Background:
 * In real-world usage, users may provide multiple invalid inputs simultaneously.
 * The parser must handle these gracefully, providing clear error messages that
 * help users identify and fix the primary issue first. Proper error prioritization
 * prevents confusion and guides users toward successful command construction.
 *
 * Intent:
 * - Verify error prioritization when multiple errors exist
 * - Ensure parameter errors take precedence over option errors
 * - Validate consistent error messages across similar error types
 * - Test edge cases with combined parameter and option errors
 * - Confirm that error handling remains robust under complex scenarios
 *
 * Test Coverage:
 * - Parameter errors combined with valid options
 * - Parameter errors combined with invalid options
 * - Option constraint violations in different modes
 * - Multiple simultaneous error conditions
 * - Error message consistency across similar scenarios
 *
 * Error Types:
 * - Parameter errors: Invalid commands, too many arguments, invalid types
 * - Option errors: Invalid options, constraint violations, format errors
 * - Priority rule: Parameter validation occurs before option validation
 */

import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/mod.ts';
import type { ParamsResult } from '../../src/mod.ts';

/**
 * Helper function: Validates error results for consistent error handling
 *
 * Purpose:
 * Provides a centralized method to verify error results with consistent
 * assertions across all error combination test cases. This ensures uniform
 * error validation throughout the test suite.
 *
 * Background:
 * Error validation requires checking multiple properties (type, message, code,
 * category) consistently. This helper eliminates duplication and ensures all
 * error tests follow the same validation pattern.
 *
 * Intent:
 * - Verify the result is of error type
 * - Check that error messages contain expected substrings
 * - Validate error codes match expected values
 * - Ensure error category is consistently 'validation'
 *
 * @param result - The parsed result to validate
 * @param expectedErrorSubstring - Substring expected in the error message
 * @param expectedCode - The expected error code (e.g., 'INVALID_COMMAND')
 * @param testDescription - Description for assertion messages
 */
function assertErrorResult(
  result: ParamsResult,
  expectedErrorSubstring: string,
  expectedCode: string,
  testDescription: string,
) {
  assertEquals(result.type, 'error', `${testDescription}: Should be error type`);
  assertStringIncludes(
    result.error?.message || '',
    expectedErrorSubstring,
    `${testDescription}: Error message should contain '${expectedErrorSubstring}'`,
  );
  assertEquals(
    result.error?.code,
    expectedCode,
    `${testDescription}: Error code should be '${expectedCode}'`,
  );
  assertEquals(
    result.error?.category,
    'validation',
    `${testDescription}: Error category should be 'validation'`,
  );
}

Deno.test('Error Combinations - Parameter Errors with Valid Options', async (t) => {
  const parser = new ParamsParser();

  // Test cases: Parameter errors combined with valid options
  const combinations = [
    // Invalid command + valid options
    {
      args: ['unknown', '--from=input.md'],
      expectedError: 'Invalid command: unknown',
      expectedCode: 'INVALID_COMMAND',
      description: 'Invalid command with valid option',
    },
    {
      args: ['invalid_command', '--destination=output.md', '--config=test'],
      expectedError: 'Invalid command: invalid_command',
      expectedCode: 'INVALID_COMMAND',
      description: 'Invalid command with multiple valid options',
    },
    // Too many arguments + valid options
    {
      args: ['to', 'project', 'extra', '--from=input.md'],
      expectedError: 'Too many arguments',
      expectedCode: 'TOO_MANY_ARGS',
      description: 'Too many arguments with valid option',
    },
    {
      args: ['to', 'issue', 'extra', 'more', '--config=test', '--adaptation=strict'],
      expectedError: 'Too many arguments',
      expectedCode: 'TOO_MANY_ARGS',
      description: 'Too many arguments with multiple valid options',
    },
    // Invalid directive type + valid options
    {
      args: ['invalid', 'project', '--from=input.md'],
      expectedError: 'Invalid directive type',
      expectedCode: 'INVALID_DIRECTIVE_TYPE',
      description: 'Invalid directive type with valid option',
    },
    {
      args: ['wrong_demo', 'issue', '--destination=output.md', '--input=task'],
      expectedError: 'Invalid directive type',
      expectedCode: 'INVALID_DIRECTIVE_TYPE',
      description: 'Invalid directive type with multiple valid options',
    },
    // Invalid layer type + valid options
    {
      args: ['to', 'invalid', '--config=test'],
      expectedError: 'Invalid layer type',
      expectedCode: 'INVALID_LAYER_TYPE',
      description: 'Invalid layer type with valid option',
    },
    {
      args: ['summary', 'wrong_layer', '--from=input.md', '--adaptation=strict'],
      expectedError: 'Invalid layer type',
      expectedCode: 'INVALID_LAYER_TYPE',
      description: 'Invalid layer type with multiple valid options',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Parameter Error + Valid Options ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as ParamsResult;

      assertErrorResult(
        result,
        testCase.expectedError,
        testCase.expectedCode,
        `Parameter error with valid options ${i + 1}`,
      );
    });
  }
});

Deno.test('Error Combinations - Parameter Errors with Invalid Options', async (t) => {
  const parser = new ParamsParser();

  // Test cases: Parameter errors + invalid options (parameter errors should take precedence)
  const combinations = [
    // Invalid command + invalid option
    {
      args: ['unknown', '--invalid=value'],
      expectedError: 'Invalid command: unknown',
      expectedCode: 'INVALID_COMMAND',
      description: 'Invalid command with invalid option - command error should take precedence',
    },
    // Too many arguments + invalid option
    {
      args: ['to', 'project', 'extra', '--unknown=value'],
      expectedError: 'Too many arguments',
      expectedCode: 'TOO_MANY_ARGS',
      description: 'Too many arguments with invalid option - args error should take precedence',
    },
    // Invalid directive type + invalid option
    {
      args: ['invalid', 'project', '--nonexistent=value'],
      expectedError: 'Invalid directive type',
      expectedCode: 'INVALID_DIRECTIVE_TYPE',
      description:
        'Invalid directive type with invalid option - param error should take precedence',
    },
    // Invalid layer type + invalid option
    {
      args: ['to', 'invalid', '--badoption=value'],
      expectedError: 'Invalid layer type',
      expectedCode: 'INVALID_LAYER_TYPE',
      description: 'Invalid layer type with invalid option - param error should take precedence',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Parameter Error + Invalid Options ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as ParamsResult;

      assertErrorResult(
        result,
        testCase.expectedError,
        testCase.expectedCode,
        `Parameter error with invalid options ${i + 1}`,
      );
    });
  }
});

Deno.test('Error Combinations - Option Constraint Violations', async (t) => {
  const parser = new ParamsParser();

  // Test cases: Option constraint violation combinations
  const combinations = [
    // OneParam + multiple invalid options
    {
      args: ['init', '--config=test', '--from=input.md'],
      expectedError: 'Invalid options for one parameters',
      expectedCode: 'INVALID_OPTIONS',
      description: 'OneParam with multiple invalid options',
    },
    {
      args: ['init', '--uv-test=value', '--destination=output.md'],
      expectedError: 'Invalid options for one parameters',
      expectedCode: 'INVALID_OPTIONS',
      description: 'OneParam with user variable and standard option',
    },
    // ZeroParams + multiple invalid options
    {
      args: ['--config=test', '--uv-test=value'],
      expectedError: 'Invalid options for zero parameters',
      expectedCode: 'INVALID_OPTIONS',
      description: 'ZeroParams with config and user variable',
    },
    {
      args: ['--from=input.md', '--destination=output.md'],
      expectedError: 'Invalid options for zero parameters',
      expectedCode: 'INVALID_OPTIONS',
      description: 'ZeroParams with multiple standard options',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Option Constraint Violation ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as ParamsResult;

      assertErrorResult(
        result,
        testCase.expectedError,
        testCase.expectedCode,
        `Option constraint violation ${i + 1}`,
      );
    });
  }
});

Deno.test('Error Combinations - Multiple Error Scenarios', async (t) => {
  const parser = new ParamsParser();

  // Test cases: Priority testing when multiple error factors exist simultaneously
  const combinations = [
    // Invalid command + constraint violation options
    {
      args: ['unknown', '--config=test'],
      expectedError: 'Invalid command: unknown',
      expectedCode: 'INVALID_COMMAND',
      description: 'Invalid command should take precedence over option constraint',
    },
    // Too many arguments + invalid option + constraint violation
    {
      args: ['to', 'project', 'extra', 'more', '--unknown=value', '--config=test'],
      expectedError: 'Too many arguments',
      expectedCode: 'TOO_MANY_ARGS',
      description: 'Parameter error should take precedence over option errors',
    },
    // Invalid directive type + layer type + options
    {
      args: ['invalid', 'also_invalid', '--nonexistent=value'],
      expectedError: 'Invalid directive type',
      expectedCode: 'INVALID_DIRECTIVE_TYPE',
      description: 'First parameter error should take precedence',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Multiple Error Scenario ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as ParamsResult;

      assertErrorResult(
        result,
        testCase.expectedError,
        testCase.expectedCode,
        `Multiple error scenario ${i + 1}`,
      );
    });
  }
});

Deno.test('Error Combinations - Boundary Value Errors', async (t) => {
  const parser = new ParamsParser();

  await t.step('Empty values with parameter errors', () => {
    const args = ['invalid', 'project', '--from=', '--destination='];
    const result = parser.parse(args) as ParamsResult;

    assertErrorResult(
      result,
      'Invalid directive type',
      'INVALID_DIRECTIVE_TYPE',
      'Empty option values with parameter error',
    );
  });

  await t.step('Special characters with parameter errors', () => {
    const args = ['@#$invalid', 'project', '--from=file@#$.md'];
    const result = parser.parse(args) as ParamsResult;

    assertErrorResult(
      result,
      'Invalid directive type',
      'INVALID_DIRECTIVE_TYPE',
      'Special characters with parameter error',
    );
  });

  await t.step('Very long parameters with option errors', () => {
    const longParam = 'x'.repeat(1000);
    const args = [longParam, 'project', '--unknown=value'];
    const result = parser.parse(args) as ParamsResult;

    assertErrorResult(
      result,
      'Invalid directive type',
      'INVALID_DIRECTIVE_TYPE',
      'Long parameter with option error',
    );
  });
});

Deno.test('Error Combinations - Mixed Form Errors', async (t) => {
  const parser = new ParamsParser();

  // Test cases: Error scenarios with mixed long/short form options
  const combinations = [
    // OneParam + mixed long/short form invalid options
    {
      args: ['init', '--config=test', '-f=input.md'],
      expectedError: 'Invalid options for one parameters',
      expectedCode: 'INVALID_OPTIONS',
      description: 'OneParam with mixed form invalid options',
    },
    // Invalid parameter + mixed long/short forms
    {
      args: ['invalid', 'project', '--from=input.md', '-o=output.md'],
      expectedError: 'Invalid directive type',
      expectedCode: 'INVALID_DIRECTIVE_TYPE',
      description: 'Invalid parameter with mixed form options',
    },
    // Too many arguments + user variables + mixed forms
    {
      args: ['to', 'project', 'extra', '-f=input.md', '--uv-test=value'],
      expectedError: 'Too many arguments',
      expectedCode: 'TOO_MANY_ARGS',
      description: 'Too many args with mixed forms and user variables',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Mixed Form Error ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as ParamsResult;

      assertErrorResult(
        result,
        testCase.expectedError,
        testCase.expectedCode,
        `Mixed form error ${i + 1}`,
      );
    });
  }
});

Deno.test('Error Combinations - Error Message Consistency', async (t) => {
  const parser = new ParamsParser();

  // Verify that similar error types return consistent messages
  await t.step('Consistent invalid command messages', () => {
    const invalidCommands = ['unknown', 'invalid', 'wrong', 'badcommand'];

    for (const cmd of invalidCommands) {
      const result = parser.parse([cmd]) as ParamsResult;

      assertEquals(result.type, 'error');
      assertStringIncludes(result.error?.message || '', 'Invalid command:');
      assertStringIncludes(result.error?.message || '', cmd);
      assertEquals(result.error?.code, 'INVALID_COMMAND');
    }
  });

  await t.step('Consistent invalid directive type messages', () => {
    const invalidDemoTypes = ['invalid', 'wrong', 'bad', 'unknown'];

    for (const demoType of invalidDemoTypes) {
      const result = parser.parse([demoType, 'project']) as ParamsResult;

      assertEquals(result.type, 'error');
      assertStringIncludes(result.error?.message || '', 'Invalid directive type');
      assertEquals(result.error?.code, 'INVALID_DIRECTIVE_TYPE');
    }
  });

  await t.step('Consistent invalid layer type messages', () => {
    const invalidLayerTypes = ['invalid', 'wrong', 'bad', 'unknown'];

    for (const layerType of invalidLayerTypes) {
      const result = parser.parse(['to', layerType]) as ParamsResult;

      assertEquals(result.type, 'error');
      assertStringIncludes(result.error?.message || '', 'Invalid layer type');
      assertEquals(result.error?.code, 'INVALID_LAYER_TYPE');
    }
  });
});
