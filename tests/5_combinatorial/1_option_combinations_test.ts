/**
 * 複合的テスト: 標準オプション組み合わせテスト
 *
 * このテストファイルは、すべての標準オプションの組み合わせを網羅的にテストします。
 *
 * テスト対象:
 * - 2つのオプション組み合わせ (C(5,2) = 10パターン)
 * - 3つのオプション組み合わせ (C(5,3) = 10パターン)
 * - 4つのオプション組み合わせ (C(5,4) = 5パターン)
 * - すべてのオプション組み合わせ (C(5,5) = 1パターン)
 *
 * 標準オプション:
 * - --from / -f (fromFile)
 * - --destination / -o (destinationFile)
 * - --input / -i (fromLayerType)
 * - --adaptation / -a (adaptationType)
 * - --config / -c (configFile)
 */

import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/mod.ts';
import type { TwoParamsResult } from '../../src/mod.ts';

// テスト用の共通パラメータ
const DEMO_TYPE = 'to';
const LAYER_TYPE = 'project';

// ヘルパー関数: オプションの比較
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

  // 期待されていないオプションが含まれていないことを確認
  const expectedKeys = new Set(Object.keys(expected));
  const actualKeys = Object.keys(actual);
  const unexpectedKeys = actualKeys.filter((key) => !expectedKeys.has(key));

  assertEquals(
    unexpectedKeys.length,
    0,
    `${testDescription}: Unexpected options found: ${unexpectedKeys.join(', ')}`,
  );
}

// ヘルパー関数: 基本的な結果検証
function assertBasicResult(result: TwoParamsResult, testDescription: string) {
  assertEquals(result.type, 'two', `${testDescription}: Should be two params type`);
  assertEquals(result.demonstrativeType, DEMO_TYPE, `${testDescription}: Wrong demonstrative type`);
  assertEquals(result.layerType, LAYER_TYPE, `${testDescription}: Wrong layer type`);
}

Deno.test('Standard Option Combinations - 2 Options', async (t) => {
  const parser = new ParamsParser();

  // 2つのオプション組み合わせテストデータ
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
      expected: { from: 'input.md', input: 'task' },
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
      expected: { destination: 'output.md', input: 'task' },
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
      expected: { input: 'task', adaptation: 'strict' },
      description: 'input + adaptation',
    },
    // input + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--input=task', '--config=test'],
      expected: { input: 'task', config: 'test' },
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

    await t.step(`2-Option Combination ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

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

  // 3つのオプション組み合わせテストデータ
  const combinations = [
    // from + destination + input
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--destination=output.md', '--input=task'],
      expected: { from: 'input.md', destination: 'output.md', input: 'task' },
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
      expected: { from: 'input.md', input: 'task', adaptation: 'strict' },
      description: 'from + input + adaptation',
    },
    // from + input + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--input=task', '--config=test'],
      expected: { from: 'input.md', input: 'task', config: 'test' },
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
      expected: { destination: 'output.md', input: 'task', adaptation: 'strict' },
      description: 'destination + input + adaptation',
    },
    // destination + input + config
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=output.md', '--input=task', '--config=test'],
      expected: { destination: 'output.md', input: 'task', config: 'test' },
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
      expected: { input: 'task', adaptation: 'strict', config: 'test' },
      description: 'input + adaptation + config',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

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

  // 4つのオプション組み合わせテストデータ
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
      expected: { from: 'input.md', destination: 'output.md', input: 'task', adaptation: 'strict' },
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
      expected: { from: 'input.md', destination: 'output.md', input: 'task', config: 'test' },
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
      expected: { from: 'input.md', input: 'task', adaptation: 'strict', config: 'test' },
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
      expected: { destination: 'output.md', input: 'task', adaptation: 'strict', config: 'test' },
      description: 'destination + input + adaptation + config',
    },
  ];

  for (let i = 0; i < combinations.length; i++) {
    const testCase = combinations[i];

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
      input: 'task',
      adaptation: 'strict',
      config: 'test',
    };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'All options combination');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'All options combination',
    );
  });
});

Deno.test('Standard Option Combinations - Different DemonstrativeTypes', async (t) => {
  const parser = new ParamsParser();

  const demoTypes = ['to', 'summary', 'defect'];
  const layerTypes = ['project', 'issue', 'task'];

  for (const demoType of demoTypes) {
    for (const layerType of layerTypes) {
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
        assertEquals(result.demonstrativeType, demoType);
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
