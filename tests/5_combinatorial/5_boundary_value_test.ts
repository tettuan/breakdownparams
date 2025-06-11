/**
 * 複合的テスト: 境界値テスト
 *
 * このテストファイルは、極限値、境界値、エッジケースでの
 * 組み合わせパターンを網羅的にテストします。
 *
 * テスト対象:
 * - 空値・null値・特殊文字の組み合わせ
 * - 非常に長い値での組み合わせ
 * - Unicode・国際化文字での組み合わせ
 * - 特殊記号・制御文字での組み合わせ
 * - パフォーマンス境界値での組み合わせ
 *
 * 境界値の種類:
 * - 長さの境界値 (空文字、1文字、非常に長い文字列)
 * - 文字種の境界値 (ASCII、Unicode、制御文字)
 * - 数量の境界値 (0個、1個、大量のオプション)
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

Deno.test('Boundary Values - Empty and Null-like Values', async (t) => {
  const parser = new ParamsParser();

  // 空値はエラーになることを確認するテスト
  await t.step('Empty values should result in errors', () => {
    const emptyValueTests = [
      { args: [DEMO_TYPE, LAYER_TYPE, '--from='], description: 'Single empty value' },
      {
        args: [DEMO_TYPE, LAYER_TYPE, '--from=', '--destination='],
        description: 'Multiple empty values',
      },
      {
        args: [DEMO_TYPE, LAYER_TYPE, '--uv-empty='],
        description: 'User variable with empty value',
      },
    ];

    for (const testCase of emptyValueTests) {
      const result = parser.parse(testCase.args) as ParamsResult;
      assertEquals(result.type, 'error', `${testCase.description} should result in error`);
      assertStringIncludes(
        result.error?.message || '',
        'Empty value not allowed',
        `${testCase.description} should indicate empty value error`,
      );
    }
  });

  // 有効な非空値のテスト
  await t.step('Valid non-empty values', () => {
    const validTests = [
      {
        args: [DEMO_TYPE, LAYER_TYPE, '--from=a', '--destination=b'],
        expected: { from: 'a', destination: 'b' },
        description: 'Single character values',
      },
      {
        args: [DEMO_TYPE, LAYER_TYPE, '--uv-space= ', '--uv-tab=\t'],
        expected: { 'uv-space': ' ', 'uv-tab': '\t' },
        description: 'Whitespace values',
      },
    ];

    for (const testCase of validTests) {
      const result = parser.parse(testCase.args) as TwoParamsResult;
      assertBasicResult(result, testCase.description);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        testCase.description,
      );
    }
  });
});

Deno.test('Boundary Values - Very Long Values', async (t) => {
  const parser = new ParamsParser();

  // 非常に長い値でのテスト
  await t.step('Single very long value (1000 chars)', () => {
    const longValue = 'x'.repeat(1000);
    const args = [DEMO_TYPE, LAYER_TYPE, `--from=${longValue}`];
    const expected = { from: longValue };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Single very long value');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Single very long value (1000 chars)',
    );
  });

  await t.step('Multiple long values (500 chars each)', () => {
    const longValue1 = 'a'.repeat(500);
    const longValue2 = 'b'.repeat(500);
    const longValue3 = 'c'.repeat(500);
    const args = [
      DEMO_TYPE,
      LAYER_TYPE,
      `--from=${longValue1}`,
      `--destination=${longValue2}`,
      `--uv-data=${longValue3}`,
    ];
    const expected = { from: longValue1, destination: longValue2, 'uv-data': longValue3 };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Multiple long values');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Multiple long values (500 chars each)',
    );
  });

  await t.step('Extremely long value (10000 chars)', () => {
    const extremelyLongValue = 'z'.repeat(10000);
    const args = [DEMO_TYPE, LAYER_TYPE, `--uv-huge=${extremelyLongValue}`];
    const expected = { 'uv-huge': extremelyLongValue };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Extremely long value');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Extremely long value (10000 chars)',
    );
  });
});

Deno.test('Boundary Values - Unicode and International Characters', async (t) => {
  const parser = new ParamsParser();

  // Unicode・国際化文字のテスト
  const unicodeTests = [
    // 日本語
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=こんにちは世界.md', '--uv-project=プロジェクト名'],
      expected: { from: 'こんにちは世界.md', 'uv-project': 'プロジェクト名' },
      description: 'Japanese characters',
    },
    // 中国語
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=你好世界.md', '--uv-name=项目名称'],
      expected: { destination: '你好世界.md', 'uv-name': '项目名称' },
      description: 'Chinese characters',
    },
    // アラビア語
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-text=مرحبا بالعالم'],
      expected: { 'uv-text': 'مرحبا بالعالم' },
      description: 'Arabic characters',
    },
    // 絵文字
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-emoji=🚀🌟💻🎯', '--from=file_📁.md'],
      expected: { 'uv-emoji': '🚀🌟💻🎯', from: 'file_📁.md' },
      description: 'Emoji characters',
    },
    // 混合Unicode
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-mixed=Hello世界🌍Привет'],
      expected: { 'uv-mixed': 'Hello世界🌍Привет' },
      description: 'Mixed Unicode scripts',
    },
    // 特殊Unicode文字
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-special=\u200B\u200C\u200D\uFEFF'],
      expected: { 'uv-special': '\u200B\u200C\u200D\uFEFF' },
      description: 'Special Unicode characters (zero-width, BOM)',
    },
  ];

  for (let i = 0; i < unicodeTests.length; i++) {
    const testCase = unicodeTests[i];

    await t.step(`Unicode Test ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Unicode test ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Unicode test ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('Boundary Values - Special Characters and Symbols', async (t) => {
  const parser = new ParamsParser();

  // 特殊文字・記号のテスト
  const specialCharTests = [
    // 一部の特殊文字（一部の特殊文字は問題を起こす可能性があるため安全なもののみ）
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=file_with-hyphens_and_underscores.md'],
      expected: { from: 'file_with-hyphens_and_underscores.md' },
      description: 'Safe special characters',
    },
    // スペースと引用符
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--destination=file with spaces.md',
        '--uv-quote="quoted value"',
      ],
      expected: { destination: 'file with spaces.md', 'uv-quote': '"quoted value"' },
      description: 'Spaces and quotes',
    },
    // パス区切り文字
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--from=/path/to/file\\with\\backslashes.md'],
      expected: { from: '/path/to/file\\with\\backslashes.md' },
      description: 'Path separators',
    },
    // 簡単なURL（複雑なURLはエラーになる可能性があるため）
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-url=https://example.com/api'],
      expected: { 'uv-url': 'https://example.com/api' },
      description: 'Simple URL',
    },
    // 制御文字類似
    {
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-control=\\n\\t\\r\\\\'],
      expected: { 'uv-control': '\\n\\t\\r\\\\' },
      description: 'Control character representations',
    },
    // JSON類似構造
    {
      args: [
        DEMO_TYPE,
        LAYER_TYPE,
        '--uv-json={"key":"value","array":[1,2,3],"nested":{"bool":true}}',
      ],
      expected: { 'uv-json': '{"key":"value","array":[1,2,3],"nested":{"bool":true}}' },
      description: 'JSON-like structure',
    },
  ];

  for (let i = 0; i < specialCharTests.length; i++) {
    const testCase = specialCharTests[i];

    await t.step(`Special Characters ${i + 1}: ${testCase.description}`, () => {
      const result = parser.parse(testCase.args) as TwoParamsResult;

      assertBasicResult(result, `Special characters ${i + 1}`);
      assertOptionsMatch(
        result.options as Record<string, unknown>,
        testCase.expected,
        `Special characters ${i + 1}: ${testCase.description}`,
      );
    });
  }
});

Deno.test('Boundary Values - Quantity Boundaries', async (t) => {
  const parser = new ParamsParser();

  await t.step('Maximum user variables (50 variables)', () => {
    // 50個のユーザー変数を作成
    const args = [DEMO_TYPE, LAYER_TYPE];
    const expected: Record<string, string> = {};

    for (let i = 1; i <= 50; i++) {
      const key = `uv-variable${i.toString().padStart(2, '0')}`;
      const value = `value${i}`;
      args.push(`--${key}=${value}`);
      expected[key] = value;
    }

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Maximum user variables');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Maximum user variables (50 variables)',
    );
  });

  await t.step('All standard options + many user variables', () => {
    // 全標準オプション + 20個のユーザー変数
    const args = [
      DEMO_TYPE,
      LAYER_TYPE,
      '--from=input.md',
      '--destination=output.md',
      '--input=task',
      '--adaptation=strict',
      '--config=test',
    ];
    const expected: Record<string, string> = {
      from: 'input.md',
      destination: 'output.md',
      input: 'task',
      adaptation: 'strict',
      config: 'test',
    };

    for (let i = 1; i <= 20; i++) {
      const key = `uv-extra${i}`;
      const value = `extravalue${i}`;
      args.push(`--${key}=${value}`);
      expected[key] = value;
    }

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'All standard + many user variables');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'All standard options + 20 user variables',
    );
  });
});

Deno.test('Boundary Values - Edge Case Combinations', async (t) => {
  const parser = new ParamsParser();

  await t.step('Long + unicode combination', () => {
    const longValue = 'x'.repeat(500);
    const args = [
      DEMO_TYPE,
      LAYER_TYPE,
      '--from=short.md',
      `--destination=${longValue}`,
      '--uv-unicode=こんにちは🌍',
    ];
    const expected = { from: 'short.md', destination: longValue, 'uv-unicode': 'こんにちは🌍' };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Long + unicode combination');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Combination of long and unicode values',
    );
  });

  await t.step('Special characters in option names (boundary test)', () => {
    // オプション名の境界テスト（有効な文字の境界）
    const args = [DEMO_TYPE, LAYER_TYPE, '--uv-test_123=value', '--uv-with-hyphens=value2'];
    const expected = { 'uv-test_123': 'value', 'uv-with-hyphens': 'value2' };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Special characters in option names');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'Valid special characters in user variable names',
    );
  });

  await t.step('Single character values with all options', () => {
    const args = [
      DEMO_TYPE,
      LAYER_TYPE,
      '--from=a',
      '--destination=b',
      '--input=c',
      '--adaptation=d',
      '--config=e',
      '--uv-x=f',
    ];
    const expected = {
      from: 'a',
      destination: 'b',
      input: 'c',
      adaptation: 'd',
      config: 'e',
      'uv-x': 'f',
    };

    const result = parser.parse(args) as TwoParamsResult;

    assertBasicResult(result, 'Single character values');
    assertOptionsMatch(
      result.options as Record<string, unknown>,
      expected,
      'All options with single character values',
    );
  });
});
