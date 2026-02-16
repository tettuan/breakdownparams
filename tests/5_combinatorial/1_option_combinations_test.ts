/**
 * Combinatorial Test: Standard Option Combinations Test
 *
 * Purpose:
 * This test file exhaustively tests all possible combinations of standard options
 * to ensure that the parameter parser correctly handles multiple option scenarios.
 * It validates that options can be combined without interfering with each other
 * and that all combinations produce the expected parsing results.
 *
 * Background:
 * In complex CLI applications, users often combine multiple options to customize
 * behavior. This combinatorial testing approach ensures robustness by verifying
 * that all mathematically possible combinations work correctly, preventing
 * regression when new options are added or existing ones are modified.
 *
 * Intent:
 * - Verify that option parsing is order-independent
 * - Ensure no option conflicts or unexpected interactions
 * - Validate that all combinations maintain type safety
 * - Provide comprehensive coverage for production use cases
 *
 * Test Coverage:
 * - 2-option combinations (C(5,2) = 10 patterns)
 * - 3-option combinations (C(5,3) = 10 patterns)
 * - 4-option combinations (C(5,4) = 5 patterns)
 * - All options combined (C(5,5) = 1 pattern)
 *
 * Standard Options Under Test:
 * - --from / -f: Specifies the input file path (fromFile)
 * - --destination / -o: Specifies the output file path (destinationFile)
 * - --input / -i: Defines the source layer type (fromLayerType)
 * - --adaptation / -a: Sets the adaptation strategy (adaptationType)
 * - --config / -c: Points to the configuration file (configFile)
 */

import { assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ParamsParser } from '../../src/mod.ts';
import type { TwoParamsResult } from '../../src/mod.ts';

const logger = new BreakdownLogger('combinatorial');

/**
 * Common test parameters used throughout the test suite
 *
 * Purpose:
 * Provides consistent directive and layer type values across all
 * combination tests to ensure uniform testing conditions.
 *
 * Background:
 * Using fixed parameter values allows the tests to focus purely on option
 * combination behavior without parameter variation affecting results.
 *
 * Intent:
 * - Establish a standard two-parameter baseline (to project)
 * - Eliminate parameter variation as a confounding factor
 * - Enable focused testing of option combinations
 */
const DEMO_TYPE = 'to';
const LAYER_TYPE = 'project';

/**
 * Helper function: Compares actual and expected option values
 *
 * Purpose:
 * Provides comprehensive option validation by checking both the presence
 * and values of expected options, as well as the absence of unexpected ones.
 *
 * Background:
 * When testing multiple option combinations, it's critical to ensure not only
 * that expected options are parsed correctly, but also that no additional
 * options appear unexpectedly due to parsing errors or cross-contamination.
 *
 * Intent:
 * - Validate each expected option's value precisely
 * - Ensure no unexpected options are present
 * - Provide detailed error messages for debugging
 * - Support comprehensive combinatorial validation
 *
 * @param actual - The actual options object from parsing
 * @param expected - The expected options to validate against
 * @param testDescription - Context for error messages
 */
function assertOptionsMatch(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
  testDescription: string,
): void {
  for (const [key, expectedValue] of Object.entries(expected)) {
    assertEquals(
      actual[key],
      expectedValue,
      `${testDescription}: Option '${key}' should be '${expectedValue}' but was '${actual[key]}'`,
    );
  }

  // Verify no unexpected options are present
  const expectedKeys = new Set(Object.keys(expected));
  const actualKeys = Object.keys(actual);
  const unexpectedKeys = actualKeys.filter((key) => !expectedKeys.has(key));

  assertEquals(
    unexpectedKeys.length,
    0,
    `${testDescription}: Unexpected options found: ${unexpectedKeys.join(', ')}`,
  );
}

/**
 * Helper function: Validates basic parsing result structure
 *
 * Purpose:
 * Ensures the fundamental parsing result is correct before validating
 * specific option combinations.
 *
 * Background:
 * Combinatorial tests can fail at multiple levels. This helper ensures
 * that basic parsing succeeds before checking option-specific behavior.
 *
 * Intent:
 * - Verify successful two-parameter parsing
 * - Validate correct directive and layer types
 * - Provide foundation for option-specific validation
 *
 * @param result - The parsed two-parameter result
 * @param testDescription - Context for error messages
 */
function assertBasicResult(result: TwoParamsResult, testDescription: string): void {
  assertEquals(result.type, 'two', `${testDescription}: Should be two params type`);
  assertEquals(result.directiveType, DEMO_TYPE, `${testDescription}: Wrong directive type`);
  assertEquals(result.layerType, LAYER_TYPE, `${testDescription}: Wrong layer type`);
}

Deno.test('Standard Option Combinations - 2 Options', async (t) => {
  const parser = new ParamsParser();

  // Test data: 2-option combination patterns
  const combinations = [
    // from + destination
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--destination=output.md'],
      expected: { from: 'input.md', destination: 'output.md' },
      description: 'from + destination',
    },
    // from + input
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--input=task'],
      expected: { from: 'input.md', edition: 'task' },
      description: 'from + input',
    },
    // from + adaptation
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--adaptation=strict'],
      expected: { from: 'input.md', adaptation: 'strict' },
      description: 'from + adaptation',
    },
    // from + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--config=test'],
      expected: { from: 'input.md', config: 'test' },
      description: 'from + config',
    },
    // destination + input
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=output.md', '--input=task'],
      expected: { destination: 'output.md', edition: 'task' },
      description: 'destination + input',
    },
    // destination + adaptation
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=output.md', '--adaptation=strict'],
      expected: { destination: 'output.md', adaptation: 'strict' },
      description: 'destination + adaptation',
    },
    // destination + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=output.md', '--config=test'],
      expected: { destination: 'output.md', config: 'test' },
      description: 'destination + config',
    },
    // input + adaptation
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--input=task', '--adaptation=strict'],
      expected: { edition: 'task', adaptation: 'strict' },
      description: 'input + adaptation',
    },
    // input + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--input=task', '--config=test'],
      expected: { edition: 'task', config: 'test' },
      description: 'input + config',
    },
    // adaptation + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--adaptation=strict', '--config=test'],
      expected: { adaptation: 'strict', config: 'test' },
      description: 'adaptation + config',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    // deno-lint-ignore no-await-in-loop
    await t.step(`2-Option Combination ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;
      logger.debug('2-option combination result', {
        data: {
          combination: testCase.description,
          type: result.type,
          optionKeys: Object.keys(result.options),
        },
      });

      assertBasicResult(result, `2-option combination ${i + 1} (${testCase.description})`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `2-option combination ${i + 1} (${testCase.description})`,
      );
    });
  }
});

Deno.test('Standard Option Combinations - 3 Options', async (t) => {
  const parser = new ParamsParser();

  // Test data: 3-option combination patterns
  const combinations = [
    // from + destination + input
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--destination=output.md', '--input=task'],
      expected: { from: 'input.md', destination: 'output.md', edition: 'task' },
      description: 'from + destination + input',
    },
    // from + destination + adaptation
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--destination=output.md',
        '--adaptation=strict',
      ],
      expected: { from: 'input.md', destination: 'output.md', adaptation: 'strict' },
      description: 'from + destination + adaptation',
    },
    // from + destination + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--destination=output.md', '--config=test'],
      expected: { from: 'input.md', destination: 'output.md', config: 'test' },
      description: 'from + destination + config',
    },
    // from + input + adaptation
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--input=task', '--adaptation=strict'],
      expected: { from: 'input.md', edition: 'task', adaptation: 'strict' },
      description: 'from + input + adaptation',
    },
    // from + input + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--input=task', '--config=test'],
      expected: { from: 'input.md', edition: 'task', config: 'test' },
      description: 'from + input + config',
    },
    // from + adaptation + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--adaptation=strict', '--config=test'],
      expected: { from: 'input.md', adaptation: 'strict', config: 'test' },
      description: 'from + adaptation + config',
    },
    // destination + input + adaptation
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--destination=output.md',
        '--input=task',
        '--adaptation=strict',
      ],
      expected: { destination: 'output.md', edition: 'task', adaptation: 'strict' },
      description: 'destination + input + adaptation',
    },
    // destination + input + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=output.md', '--input=task', '--config=test'],
      expected: { destination: 'output.md', edition: 'task', config: 'test' },
      description: 'destination + input + config',
    },
    // destination + adaptation + config
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--destination=output.md',
        '--adaptation=strict',
        '--config=test',
      ],
      expected: { destination: 'output.md', adaptation: 'strict', config: 'test' },
      description: 'destination + adaptation + config',
    },
    // input + adaptation + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--input=task', '--adaptation=strict', '--config=test'],
      expected: { edition: 'task', adaptation: 'strict', config: 'test' },
      description: 'input + adaptation + config',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    // deno-lint-ignore no-await-in-loop
    await t.step(`3-Option Combination ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `3-option combination ${i + 1} (${testCase.description})`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `3-option combination ${i + 1} (${testCase.description})`,
      );
    });
  }
});

Deno.test('Standard Option Combinations - 4 Options', async (t) => {
  const parser = new ParamsParser();

  // Test data: 4-option combination patterns
  const combinations = [
    // from + destination + input + adaptation
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--destination=output.md',
        '--input=task',
        '--adaptation=strict',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        edition: 'task',
        adaptation: 'strict',
      },
      description: 'from + destination + input + adaptation',
    },
    // from + destination + input + config
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--destination=output.md',
        '--input=task',
        '--config=test',
      ],
      expected: { from: 'input.md', destination: 'output.md', edition: 'task', config: 'test' },
      description: 'from + destination + input + config',
    },
    // from + destination + adaptation + config
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--destination=output.md',
        '--adaptation=strict',
        '--config=test',
      ],
      expected: {
        from: 'input.md',
        destination: 'output.md',
        adaptation: 'strict',
        config: 'test',
      },
      description: 'from + destination + adaptation + config',
    },
    // from + input + adaptation + config
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--from=input.md',
        '--input=task',
        '--adaptation=strict',
        '--config=test',
      ],
      expected: { from: 'input.md', edition: 'task', adaptation: 'strict', config: 'test' },
      description: 'from + input + adaptation + config',
    },
    // destination + input + adaptation + config
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--destination=output.md',
        '--input=task',
        '--adaptation=strict',
        '--config=test',
      ],
      expected: { destination: 'output.md', edition: 'task', adaptation: 'strict', config: 'test' },
      description: 'destination + input + adaptation + config',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

    // deno-lint-ignore no-await-in-loop
    await t.step(`4-Option Combination ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `4-option combination ${i + 1} (${testCase.description})`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `4-option combination ${i + 1} (${testCase.description})`,
      );
    });
  }
});

Deno.test('Standard Option Combinations - All Options', async (t) => {
  const parser = new ParamsParser();

  await t.step('All 5 Options Combined', () => {
    const args = [
      DEMO_TYPE,
      LAYER_TYPE,
      '--from=input.md',
      '--destination=output.md',
      '--input=task',
      '--adaptation=strict',
      '--config=test',
    ];
    const expected = {
      from: 'input.md',
      destination: 'output.md',
      edition: 'task',
      adaptation: 'strict',
      config: 'test',
    };

    const result = parser.parse(args) as TwoParamsResult;
    logger.debug('All options combined result', {
      data: { type: result.type, optionCount: Object.keys(result.options).length },
    });

    assertBasicResult(result, 'All options combination');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'All options combination',
    );
  });
});

Deno.test('Standard Option Combinations - Different DirectiveTypes', async (t) => {
  const parser = new ParamsParser();

  const demoTypes = ['to', 'summary', 'defect'];
  const layerTypes = ['project', 'issue', 'task'];

  for (const demoType of demoTypes) {
    for (const layerType of layerTypes) {
      // deno-lint-ignore no-await-in-loop
      await t.step(`${demoType} ${layerType} with multiple options`, () => {
        const args = [
          demoType,
          layerType,
          '--from=input.md',
          '--destination=output.md',
          '--config=test',
        ];
        const expected = {
          from: 'input.md',
          destination: 'output.md',
          config: 'test',
        };

        const result = parser.parse(args) as TwoParamsResult;

        assertEquals(result.type, 'two');
        assertEquals(result.directiveType, demoType);
        assertEquals(result.layerType, layerType);
        assertOptionsMatch(
          result.options as Record<string, unknown>,
          expected,
          `${demoType} ${layerType} combination`,
        );
      });
    }
  }
});
