/**
 * Combinatorial Test: Long Form and Short Form Mixed Combinations Test
 *
 * Purpose:
 * This test file validates the mixed usage patterns of long-form (--option) and
 * short-form (-o) options, ensuring proper parsing and priority resolution when
 * both forms are used together. It verifies that the parser handles all possible
 * combinations gracefully without conflicts or unexpected behavior.
 *
 * Background:
 * Command-line interfaces often support both long and short forms for options to
 * provide flexibility to users. Some users prefer short forms for quick typing,
 * while others prefer long forms for clarity. Mixed usage is common in real-world
 * scenarios, especially in scripts that evolve over time or when options are
 * copied from different sources.
 *
 * Intent:
 * - Verify that long and short forms can be mixed freely
 * - Ensure consistent priority resolution when the same option appears multiple times
 * - Validate that the parser correctly handles edge cases in mixed scenarios
 * - Guarantee predictable behavior regardless of form combination patterns
 *
 * Test Coverage:
 * - Mixed long/short form usage patterns across multiple options
 * - Priority resolution when the same option appears in both forms
 * - Random mixed patterns to simulate real-world usage
 * - Order dependency verification to ensure consistent parsing
 *
 * Priority Rules:
 * - Last-specified option takes precedence (last-wins strategy)
 * - Priority is determined by order only, regardless of form (long vs short)
 * - This ensures predictable behavior when options are overridden
 */

import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/mod.ts';
import type { ParamsResult, TwoParamsResult } from '../../src/mod.ts';

/**
 * Common test parameters used throughout the test suite
 *
 * Purpose:
 * Provides consistent parameter values to ensure all tests operate on the same
 * baseline, making results comparable and reproducible.
 *
 * Background:
 * Using fixed directive and layer types allows tests to focus exclusively
 * on option form mixing behavior without parameter variations affecting results.
 *
 * Intent:
 * - Establish a standard two-parameter context (to project)
 * - Eliminate parameter variation as a test variable
 * - Enable focus on long/short form option parsing
 */
const DEMO_TYPE = 'to';
const LAYER_TYPE = 'project';

/**
 * Helper function: Validates options by comparing actual vs expected values
 *
 * Purpose:
 * Provides detailed option-by-option comparison to identify specific mismatches
 * in complex mixed-form option scenarios.
 *
 * Background:
 * When testing multiple option forms together, it's crucial to know exactly
 * which option failed parsing or had incorrect priority resolution.
 *
 * Intent:
 * - Check each expected option individually
 * - Provide clear error messages for each mismatch
 * - Support partial validation of option subsets
 *
 * @param actual - The actual parsed options object
 * @param expected - The expected option values to validate
 * @param testDescription - Context for error messages
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
 * Helper function: Validates basic parsing result structure
 *
 * Purpose:
 * Ensures that the fundamental parsing result is correct before checking
 * specific option values in mixed-form tests.
 *
 * Background:
 * Mixed-form tests can fail at different levels - basic parsing might fail,
 * or parsing might succeed but with incorrect option interpretation. This
 * helper validates the first level.
 *
 * Intent:
 * - Verify the result is a valid two-parameter parse
 * - Check that directive and layer types are correct
 * - Provide a foundation for subsequent option validation
 *
 * @param result - The parsed two-parameter result
 * @param testDescription - Context for error messages
 */
function assertBasicResult(result: TwoParamsResult, testDescription: string) {
  assertEquals(result.type, 'two', `${testDescription}: Should be two params type`);
  assertEquals(result.directiveType, DEMO_TYPE, `${testDescription}: Wrong directive type`);
  assertEquals(result.layerType, LAYER_TYPE, `${testDescription}: Wrong layer type`);
}

Deno.test('Mixed Form Combinations - Basic Patterns', async (t) => {
  const parser = new ParamsParser();

  // Test data: Basic mixed form patterns
  const combinations = [
    // Short-long-short pattern
    {
      args: [DEMO_TYPE, LAYER_TYPE, '-f=input.md', '--destination=output.md', '-i=task'],
      expected: { from: 'input.md', destination: 'output.md', edition: 'task' },
      description: 'short-long-short pattern',
    },
    // Long-short-long pattern
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '-o=output.md', '--adaptation=strict'],
      expected: { from: 'input.md', destination: 'output.md', adaptation: 'strict' },
      description: 'long-short-long pattern',
    },
    // All short forms
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '-f=input.md',
        '-o=output.md',
        '-i=task',
        '-a=strict',
        '-c=test',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        edition: 'task',
        adaptation: 'strict',
        config: 'test',
      },
      description: 'all short forms',
    },
    // All long forms
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--destination=output.md',
        '--input=task',
        '--adaptation=strict',
        '--config=test',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        edition: 'task',
        adaptation: 'strict',
        config: 'test',
      },
      description: 'all long forms',
    },
    // Random mix of forms
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '-f=input.md',
        '--destination=output.md',
        '-i=task',
        '--config=test',
      ],
      expected: { from: 'input.md', destination: 'output.md', edition: 'task', config: 'test' },
      description: 'random mixed pattern',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    await t.step(`Mixed Pattern ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Mixed pattern ${i + 1} (${testCase.description})`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Mixed pattern ${i + 1} (${testCase.description})`,
      );
    });
  }
});

Deno.test('Mixed Form Combinations - Priority Tests', async (t) => {
  const parser = new ParamsParser();

  // Test data: Priority resolution scenarios
  const priorityTests = [
    // Long form first, short form later → Last option (short form) takes precedence
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=long.md', '-f=short.md'],
      expected: { from: 'short.md' },
      description: 'Long form first, short form second - last option should win',
    },
    // Short form first, long form later → Last option (long form) takes precedence
    {
      args: [DEMO_TYPE, LAYER_TYPE, '-f=short.md', '--from=long.md'],
      expected: { from: 'long.md' },
      description: 'Short form first, long form second - last option should win',
    },
    // Mixed priority test with multiple options
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '-f=short.md',
        '--from=long.md',
        '-o=short_out.md',
        '--destination=long_out.md',
      ],
      expected: { from: 'long.md', destination: 'long_out.md' },
      description: 'Multiple options priority test - last options should win',
    },
    // Same form duplication (last wins)
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=first.md', '--from=second.md'],
      expected: { from: 'second.md' },
      description: 'Same form duplication - later should win',
    },
    {
      args: [DEMO_TYPE, LAYER_TYPE, '-f=first.md', '-f=second.md'],
      expected: { from: 'second.md' },
      description: 'Same short form duplication - later should win',
    },
  ];

  for (let i = 0; i < priorityTests.length; i++) {
    const testCase = priorityTests[i];

    await t.step(`Priority Test ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Priority test ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Priority test ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('Mixed Form Combinations - Complex Scenarios', async (t) => {
  const parser = new ParamsParser();

  // Test data: Complex scenario combinations
  const complexTests = [
    // Mixed forms + duplicates + multiple options
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '-f=short.md',
        '--from=long.md',
        '-o=short_out.md',
        '--input=task',
        '-a=short_adapt',
        '--adaptation=long_adapt',
      ],
      expected: {
        from: 'long.md',
        destination: 'short_out.md',
        edition: 'task',
        adaptation: 'long_adapt',
      },
      description: 'Complex mixed forms with duplicates and priorities',
    },
    // Randomized order
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--config=test',
        '-f=input.md',
        '--destination=output.md',
        '-i=task',
        '--adaptation=strict',
      ],
      expected: {
        config: 'test',
        from: 'input.md',
        destination: 'output.md',
        edition: 'task',
        adaptation: 'strict',
      },
      description: 'Random order mixed forms',
    },
    // Extreme duplication
    {
      args: [DEMO_TYPE, LAYER_TYPE, '-f=1.md', '--from=2.md', '-f=3.md', '--from=4.md', '-f=5.md'],
      expected: { from: '5.md' },
      description: 'Extreme duplication - last option should win',
    },
  ];

  for (let i = 0; i < complexTests.length; i++) {
    const testCase = complexTests[i];

    await t.step(`Complex Scenario ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Complex scenario ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Complex scenario ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('Mixed Form Combinations - Order Independence', async (t) => {
  const parser = new ParamsParser();

  // Order independence test: Same option set in different sequences
  const baseOptions = {
    from: 'input.md',
    destination: 'output.md',
    edition: 'task',
    adaptation: 'strict',
  };

  const orderVariations = [
    // Order 1: from, destination, input, adaptation
    ['-f=input.md', '--destination=output.md', '-i=task', '--adaptation=strict'],
    // Order 2: adaptation, input, destination, from
    ['--adaptation=strict', '-i=task', '--destination=output.md', '-f=input.md'],
    // Order 3: destination, adaptation, from, input
    ['--destination=output.md', '--adaptation=strict', '-f=input.md', '-i=task'],
    // Order 4: input, from, adaptation, destination
    ['-i=task', '-f=input.md', '--adaptation=strict', '--destination=output.md'],
  ];

  for (let i = 0; i < orderVariations.length; i++) {
    const optionArgs = orderVariations[i];

    await t.step(`Order Variation ${i + 1}`, () => {
      const args = [DEMO_TYPE, LAYER_TYPE, ...optionArgs];
      const result = parser.parse(args) as TwoParamsResult;

      assertBasicResult(result, `Order variation ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        baseOptions,
        `Order variation ${i + 1}: Options should be order-independent`,
      );
    });
  }
});

Deno.test('Mixed Form Combinations - Edge Cases', async (t) => {
  const parser = new ParamsParser();

  await t.step('Empty values with mixed forms should error', () => {
    const args = [DEMO_TYPE, LAYER_TYPE, '-f=', '--destination=', '--input=task'];
    const result = parser.parse(args) as ParamsResult;

    // Verify empty values result in errors
    assertEquals(result.type, 'error', 'Empty values should result in error');
    assertStringIncludes(
      result.error?.message || '',
      'Empty value not allowed',
      'Should indicate empty value error',
    );
  });

  await t.step('Special characters in values with mixed forms', () => {
    const args = [
      DEMO_TYPE,
      LAYER_TYPE,
      '-f=/path/with-hyphens_and_underscores.md',
      '--destination=output with spaces.md',
    ];
    const expected = {
      from: '/path/with-hyphens_and_underscores.md',
      destination: 'output with spaces.md',
    };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Special characters in values');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Special characters in values with mixed forms',
    );
  });
});
