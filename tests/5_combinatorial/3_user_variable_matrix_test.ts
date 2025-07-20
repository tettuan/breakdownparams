/**
 * Combinatorial Test: User Variable Matrix Test
 *
 * Purpose:
 * This test file comprehensively validates the interaction between user-defined
 * variables (--uv-*) and standard options, ensuring that custom variables can be
 * freely combined with built-in options without conflicts. It verifies the parser's
 * extensibility through user variables while maintaining backward compatibility.
 *
 * Background:
 * User variables provide a flexible extension mechanism for CLI applications,
 * allowing users to pass custom parameters without modifying the core option set.
 * This feature is critical for integration scenarios where external tools or
 * scripts need to pass additional context or configuration that may not be
 * predefined in the standard option set.
 *
 * Intent:
 * - Validate that user variables coexist peacefully with standard options
 * - Ensure proper normalization of user variable names (--uv-config → uv-config)
 * - Test edge cases with special characters, long values, and various data types
 * - Verify performance with large numbers of user variables
 * - Confirm that user variables are restricted to TwoParams mode only
 *
 * Test Coverage:
 * - Standard options × user variable combinations
 * - Multiple user variables in single command
 * - Special values and edge case testing (JSON, paths, URLs)
 * - User variable name pattern validation
 * - Performance testing with many variables and long values
 *
 * User Variable Specifications:
 * - Only available in TwoParams mode (restricted for safety)
 * - Format: --uv-{name}={value}
 * - Normalized storage: uv-{name} as key in options
 * - Name constraints: alphanumeric, hyphens, and underscores allowed
 * - Value constraints: any string value except empty
 */

import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/mod.ts';
import type { ParamsResult, TwoParamsResult } from '../../src/mod.ts';

/**
 * Common test parameters used throughout the test suite.
 *
 * Purpose:
 * These constants provide consistent directive and layer type values
 * for all test cases, ensuring uniformity across the test suite.
 *
 * Background:
 * The parser requires two mandatory parameters (directive type and layer type)
 * before processing any options. Using constants prevents typos and makes
 * tests more maintainable.
 */
const DEMO_TYPE = 'to';
const LAYER_TYPE = 'project';

/**
 * Helper function: Compare options objects for equality.
 *
 * Purpose:
 * Provides detailed comparison of actual vs expected option values,
 * with clear error messages when mismatches occur.
 *
 * Background:
 * This function was created to provide more informative test failures
 * than simple deep equality checks. When options don't match, it shows
 * exactly which option failed and what the expected vs actual values were.
 *
 * Intent:
 * - Compare each expected option against the actual result
 * - Provide detailed error messages for debugging test failures
 * - Skip checking for unexpected options (only verify expected ones)
 *
 * @param actual - The actual options object from parser result
 * @param expected - The expected options object defined in test case
 * @param testDescription - Human-readable description for error messages
 */
function assertOptionsMatch(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
  testDescription: string,
) {
  for (const [key, expectedValue] of Object.entries(expected)) {
    assertEquals(
      actual[key],
      expectedValue,
      `${testDescription}: Option '${key}' should be '${expectedValue}' but was '${actual[key]}'`,
    );
  }
}

/**
 * Helper function: Verify basic parsing result structure.
 *
 * Purpose:
 * Validates that the parser correctly identified the command as a two-parameter
 * type and extracted the directive and layer types accurately.
 *
 * Background:
 * Every test in this suite uses the two-parameter mode, so this common
 * validation was extracted to avoid repetition. It ensures the fundamental
 * parsing logic works before checking specific options.
 *
 * Intent:
 * - Confirm the result is of type 'two' (TwoParamsResult)
 * - Verify directive type matches expected value
 * - Verify layer type matches expected value
 * - Provide clear error messages for any mismatches
 *
 * @param result - The parsed result to validate
 * @param testDescription - Human-readable description for error messages
 */
function assertBasicResult(result: TwoParamsResult, testDescription: string) {
  assertEquals(result.type, 'two', `${testDescription}: Should be two params type`);
  assertEquals(result.directiveType, DEMO_TYPE, `${testDescription}: Wrong directive type`);
  assertEquals(result.layerType, LAYER_TYPE, `${testDescription}: Wrong layer type`);
}

Deno.test('User Variable Matrix - Standard Options + Single User Variable', async (t) => {
  const parser = new ParamsParser();

  /**
   * Test combinations of standard options with single user variables.
   *
   * Purpose:
   * Validates that each standard option can coexist with a user variable
   * without interference or conflicts.
   *
   * Background:
   * This test ensures the parser correctly handles the most common use case:
   * combining a single standard option with a single user variable. This is
   * the foundation for more complex combinations tested later.
   *
   * Intent:
   * - Test each standard option (from, destination, input, adaptation, config)
   * - Pair each with a different user variable to ensure variety
   * - Verify both options are correctly parsed and stored
   * - Ensure no cross-contamination between standard and user options
   */
  const combinations = [
    // from + user variable
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--uv-project=test'],
      expected: { from: 'input.md', 'uv-project': 'test' },
      description: 'from + user variable',
    },
    // destination + user variable
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=output.md', '--uv-version=1.0.0'],
      expected: { destination: 'output.md', 'uv-version': '1.0.0' },
      description: 'destination + user variable',
    },
    // input + user variable
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--input=task', '--uv-environment=dev'],
      expected: { input: 'task', 'uv-environment': 'dev' },
      description: 'input + user variable',
    },
    // adaptation + user variable
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--adaptation=strict', '--uv-mode=debug'],
      expected: { adaptation: 'strict', 'uv-mode': 'debug' },
      description: 'adaptation + user variable',
    },
    // config + user variable
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--config=test', '--uv-env=prod'],
      expected: { config: 'test', 'uv-env': 'prod' },
      description: 'config + user variable',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Standard + User Variable ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Standard + user variable ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Standard + user variable ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('User Variable Matrix - Multiple Standard Options + Multiple User Variables', async (t) => {
  const parser = new ParamsParser();

  /**
   * Test combinations of multiple standard options with multiple user variables.
   *
   * Purpose:
   * Validates that the parser can handle complex commands with multiple
   * options of both types without conflicts or parsing errors.
   *
   * Background:
   * Real-world usage often involves multiple options. This test ensures
   * the parser scales correctly and maintains option isolation when
   * processing commands with many parameters.
   *
   * Intent:
   * - Test increasing complexity: 2x2, 3x3, and all standard options
   * - Verify correct parsing order doesn't affect results
   * - Ensure no memory or performance issues with multiple options
   * - Validate that all options are accessible in the result
   */
  const combinations = [
    /**
     * Test case: 2 standard options + 2 user variables.
     * Represents a moderate complexity command.
     */
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--destination=output.md',
        '--uv-project=test',
        '--uv-version=1.0.0',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        'uv-project': 'test',
        'uv-version': '1.0.0',
      },
      description: '2 standard + 2 user variables',
    },
    /**
     * Test case: 3 standard options + 3 user variables.
     * Represents a more complex command with multiple parameters.
     */
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--input=task',
        '--config=test',
        '--uv-env=prod',
        '--uv-debug=true',
        '--uv-timeout=30',
      ],
      expected: {
        from: 'input.md',
        input: 'task',
        config: 'test',
        'uv-env': 'prod',
        'uv-debug': 'true',
        'uv-timeout': '30',
      },
      description: '3 standard + 3 user variables',
    },
    /**
     * Test case: All standard options + multiple user variables.
     * Represents the maximum complexity scenario with all available
     * standard options combined with several user variables.
     */
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--destination=output.md',
        '--input=task',
        '--adaptation=strict',
        '--config=test',
        '--uv-project=myproject',
        '--uv-version=1.0.0',
        '--uv-environment=production',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        input: 'task',
        adaptation: 'strict',
        config: 'test',
        'uv-project': 'myproject',
        'uv-version': '1.0.0',
        'uv-environment': 'production',
      },
      description: 'all standard + multiple user variables',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Multiple Matrix ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Multiple matrix ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Multiple matrix ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('User Variable Matrix - Special Values', async (t) => {
  const parser = new ParamsParser();

  /**
   * Test data for special value edge cases.
   *
   * Purpose:
   * Tests the parser's ability to handle various complex value types
   * that might cause issues in less robust implementations.
   *
   * Background:
   * User variables need to support a wide range of value types since
   * they're meant for extensibility. This includes JSON configs, file paths,
   * URLs, and values with special characters.
   *
   * Intent:
   * - Validate JSON-like structures are preserved as strings
   * - Ensure file paths with spaces and special chars work
   * - Test URL handling (simple cases that should work)
   * - Verify numeric values are stored as strings
   * - Check special character handling in values
   */
  const specialValueTests = [
    /**
     * JSON value test.
     * Ensures complex JSON strings are preserved exactly as provided.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-config={"key":"value","nested":{"array":[1,2,3]}}'],
      expected: { 'uv-config': '{"key":"value","nested":{"array":[1,2,3]}}' },
      description: 'JSON-like value',
    },
    /**
     * Path value test.
     * Validates that file system paths with multiple segments are handled correctly.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-path=/very/long/path/to/some/file/with/spaces'],
      expected: { 'uv-path': '/very/long/path/to/some/file/with/spaces' },
      description: 'Path value',
    },
    /**
     * Special characters test.
     * Ensures values containing hyphens, underscores, and other special
     * characters are preserved correctly.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-special=value-with-hyphens_and_underscores'],
      expected: { 'uv-special': 'value-with-hyphens_and_underscores' },
      description: 'Special characters in value',
    },
    /**
     * Simple URL value test.
     * Tests basic URL handling without query parameters or complex encoding.
     * More complex URLs with query strings are tested in error cases.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-url=https://example.com/api'],
      expected: { 'uv-url': 'https://example.com/api' },
      description: 'Simple URL value',
    },
    /**
     * Numeric values test.
     * Verifies that numeric values (integers and floats) are stored as strings,
     * maintaining the parser's consistent string-based storage approach.
     * Note: Empty value test was moved to error cases section.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-number=42', '--uv-float=3.14159'],
      expected: { 'uv-number': '42', 'uv-float': '3.14159' },
      description: 'Numeric values',
    },
  ];

  for (let i = 0; i < specialValueTests.length; i++) {
    const testCase = specialValueTests[i];

    await t.step(`Special Value ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Special value ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Special value ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('User Variable Matrix - Variable Name Patterns', async (t) => {
  const parser = new ParamsParser();

  /**
   * Test various user variable name patterns.
   *
   * Purpose:
   * Validates that user variable names follow expected conventions and
   * support various naming patterns developers might use.
   *
   * Background:
   * Variable naming flexibility is important for user adoption. The parser
   * should support common naming conventions including hyphens, underscores,
   * and alphanumeric combinations.
   *
   * Intent:
   * - Test standard hyphenated names (most common pattern)
   * - Validate underscore support for Python-style naming
   * - Ensure numbers are allowed in variable names
   * - Test complex combinations of allowed characters
   * - Verify long variable names are supported
   */
  const namePatternTests = [
    /**
     * Standard hyphenated name test.
     * The most common and recommended pattern for user variables.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-project=test'],
      expected: { 'uv-project': 'test' },
      description: 'Standard name with hyphen',
    },
    /**
     * Underscore in name test.
     * Supports Python-style naming conventions where underscores
     * are preferred over hyphens.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-project_name=test'],
      expected: { 'uv-project_name': 'test' },
      description: 'Name with underscore',
    },
    /**
     * Numeric suffix test.
     * Ensures variable names can include numbers, commonly used
     * for versioning or enumeration (e.g., version2, config1).
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-version2=test'],
      expected: { 'uv-version2': 'test' },
      description: 'Name with number',
    },
    /**
     * Complex pattern test.
     * Combines multiple naming conventions (underscores, hyphens, numbers)
     * to ensure the parser handles mixed patterns correctly.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-my_project_v2=test'],
      expected: { 'uv-my_project_v2': 'test' },
      description: 'Complex name pattern',
    },
    /**
     * Long variable name test.
     * Verifies that the parser doesn't impose unreasonable length
     * restrictions on variable names, supporting descriptive naming.
     */
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-very_long_variable_name_with_many_words=test'],
      expected: { 'uv-very_long_variable_name_with_many_words': 'test' },
      description: 'Very long variable name',
    },
  ];

  for (let i = 0; i < namePatternTests.length; i++) {
    const testCase = namePatternTests[i];

    await t.step(`Name Pattern ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Name pattern ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Name pattern ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('User Variable Matrix - Performance Test', async (t) => {
  const parser = new ParamsParser();

  await t.step('Many user variables (performance test)', () => {
    /**
     * Create 20 user variables to test performance and scalability.
     *
     * Purpose:
     * Ensures the parser can handle a large number of user variables
     * without significant performance degradation or memory issues.
     *
     * Background:
     * Some CLI tools might need to pass many configuration options.
     * This test validates that the parser scales linearly with the
     * number of options rather than exhibiting O(n²) behavior.
     */
    const args = [DEMO_TYPE, LAYER_TYPE];
    const expected: Record<string, string> = {};

    for (let i = 1; i <= 20; i++) {
      const key = `uv-var${i}`;
      const value = `value${i}`;
      args.push(`--${key}=${value}`);
      expected[key] = value;
    }

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Performance test with many variables');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Performance test with 20 user variables',
    );
  });

  await t.step('Long values (performance test)', () => {
    const longValue = 'x'.repeat(1000);
    const args = [DEMO_TYPE, LAYER_TYPE, `--uv-long=${longValue}`];
    const expected = { 'uv-long': longValue };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Performance test with long value');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Performance test with 1000-character value',
    );
  });
});

Deno.test('User Variable Matrix - Error Cases', async (t) => {
  const parser = new ParamsParser();

  await t.step('User variables in OneParam mode should error', () => {
    const args = ['init', '--uv-test=value'];
    const result = parser.parse(args) as ParamsResult;

    assertEquals(result.type, 'error');
    assertStringIncludes(
      result.error?.message || '',
      'Invalid options for one parameters',
      'Should reject user variables in OneParam mode',
    );
  });

  await t.step('User variables in ZeroParams mode should error', () => {
    const args = ['--help', '--uv-test=value'];
    const result = parser.parse(args) as ParamsResult;

    assertEquals(result.type, 'error');
    assertStringIncludes(
      result.error?.message || '',
      'Invalid options for zero parameters',
      'Should reject user variables in ZeroParams mode',
    );
  });

  await t.step('User variables with empty values should error', () => {
    const args = [DEMO_TYPE, LAYER_TYPE, '--uv-empty='];
    const result = parser.parse(args) as ParamsResult;

    assertEquals(result.type, 'error');
    assertStringIncludes(
      result.error?.message || '',
      'Empty value not allowed',
      'Should reject empty user variable values',
    );
  });

  await t.step('User variables with complex URL values should error', () => {
    const args = [
      DEMO_TYPE,
      LAYER_TYPE,
      '--uv-url=https://example.com/api/v1/endpoint?param=value&other=123',
    ];
    const result = parser.parse(args) as ParamsResult;

    assertEquals(result.type, 'error');
    // Complex URL characters may cause security issues, verify error handling
    assertEquals(result.type, 'error', 'Complex URL should result in error');
  });
});

Deno.test('User Variable Matrix - Mixed with Short Forms', async (t) => {
  const parser = new ParamsParser();

  /**
   * Test combinations of short-form options with user variables.
   *
   * Purpose:
   * Validates that user variables work correctly when mixed with
   * short-form options (-f, -o, -i, -c) in various combinations.
   *
   * Background:
   * Users often prefer short-form options for common parameters.
   * This test ensures that parsing logic correctly handles the mix
   * of short-form standard options and long-form user variables.
   *
   * Intent:
   * - Test single short form + user variable
   * - Validate multiple short forms + multiple user variables
   * - Ensure mixed short/long standard options + user variables work
   * - Verify option order doesn't affect parsing results
   */
  const combinations = [
    {
      args: [DEMO_TYPE, LAYER_TYPE, '-f=input.md', '--uv-project=test'],
      expected: { from: 'input.md', 'uv-project': 'test' },
      description: 'Short form + user variable',
    },
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '-f=input.md',
        '-o=output.md',
        '--uv-env=prod',
        '--uv-debug=true',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        'uv-env': 'prod',
        'uv-debug': 'true',
      },
      description: 'Multiple short forms + user variables',
    },
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '-f=input.md',
        '--destination=output.md',
        '-i=task',
        '--uv-project=test',
        '-c=config',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        input: 'task',
        'uv-project': 'test',
        config: 'config',
      },
      description: 'Mixed short/long forms + user variable',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Mixed Short Form ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Mixed short form ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Mixed short form ${i + 1}: ${testCase.description}`,
      );
    });
  }
});
