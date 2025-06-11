/**
 * 複合的テスト: 長形式・短形式混合組み合わせテスト
 *
 * このテストファイルは、長形式と短形式オプションの混合使用と優先度をテストします。
 *
 * テスト対象:
 * - 長形式・短形式の混合使用パターン
 * - 同一オプションの長短形式競合時の優先度
 * - ランダムな混合パターンでの正常動作
 * - オプション順序の影響確認
 *
 * 優先度ルール:
 * - 最後に指定されたオプションが有効（後勝ち）
 * - 長形式・短形式に関係なく、順序で決定される
 */

import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/mod.ts';
import type { ParamsResult, TwoParamsResult } from '../../src/mod.ts';

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
}

// ヘルパー関数: 基本的な結果検証
function assertBasicResult(result: TwoParamsResult, testDescription: string) {
  assertEquals(result.type, 'two', `${testDescription}: Should be two params type`);
  assertEquals(result.demonstrativeType, DEMO_TYPE, `${testDescription}: Wrong demonstrative type`);
  assertEquals(result.layerType, LAYER_TYPE, `${testDescription}: Wrong layer type`);
}

Deno.test('Mixed Form Combinations - Basic Patterns', async (t) => {
  const parser = new ParamsParser();

  // 基本的な混合パターンテストデータ
  const combinations = [
    // 短-長-短パターン
    {
      args: [DEMO_TYPE, LAYER_TYPE, '-f=input.md', '--destination=output.md', '-i=task'],
      expected: { from: 'input.md', destination: 'output.md', input: 'task' },
      description: 'short-long-short pattern',
    },
    // 長-短-長パターン
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '-o=output.md', '--adaptation=strict'],
      expected: { from: 'input.md', destination: 'output.md', adaptation: 'strict' },
      description: 'long-short-long pattern',
    },
    // すべて短形式
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
        input: 'task',
        adaptation: 'strict',
        config: 'test',
      },
      description: 'all short forms',
    },
    // すべて長形式
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
        input: 'task',
        adaptation: 'strict',
        config: 'test',
      },
      description: 'all long forms',
    },
    // ランダム混合
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '-f=input.md',
        '--destination=output.md',
        '-i=task',
        '--config=test',
      ],
      expected: { from: 'input.md', destination: 'output.md', input: 'task', config: 'test' },
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

  // 優先度テストデータ
  const priorityTests = [
    // 長形式が先、短形式が後 → 最後のオプション（短形式）が優先
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=long.md', '-f=short.md'],
      expected: { from: 'short.md' },
      description: 'Long form first, short form second - last option should win',
    },
    // 短形式が先、長形式が後 → 最後のオプション（長形式）が優先
    {
      args: [DEMO_TYPE, LAYER_TYPE, '-f=short.md', '--from=long.md'],
      expected: { from: 'long.md' },
      description: 'Short form first, long form second - last option should win',
    },
    // 複数オプションでの混合優先度テスト
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
    // 同一形式の重複（後勝ち）
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

  // 複雑なシナリオテストデータ
  const complexTests = [
    // 長短混合 + 重複 + 複数オプション
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
        input: 'task',
        adaptation: 'long_adapt',
      },
      description: 'Complex mixed forms with duplicates and priorities',
    },
    // 順序をランダム化
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
        input: 'task',
        adaptation: 'strict',
      },
      description: 'Random order mixed forms',
    },
    // 極端な重複
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

  // 順序独立性テスト：同じオプションセットを異なる順序で指定
  const baseOptions = {
    from: 'input.md',
    destination: 'output.md',
    input: 'task',
    adaptation: 'strict',
  };

  const orderVariations = [
    // 順序1: from, destination, input, adaptation
    ['-f=input.md', '--destination=output.md', '-i=task', '--adaptation=strict'],
    // 順序2: adaptation, input, destination, from
    ['--adaptation=strict', '-i=task', '--destination=output.md', '-f=input.md'],
    // 順序3: destination, adaptation, from, input
    ['--destination=output.md', '--adaptation=strict', '-f=input.md', '-i=task'],
    // 順序4: input, from, adaptation, destination
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

    // 空値はエラーになることを確認
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
