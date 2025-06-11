/**
 * 複合的テスト: エラー組み合わせテスト
 *
 * このテストファイルは、パラメータエラーとオプションエラーの組み合わせ、
 * および複合的なエラーケースを網羅的にテストします。
 *
 * テスト対象:
 * - パラメータエラー + 有効オプション
 * - パラメータエラー + 無効オプション
 * - オプション制約違反の組み合わせ
 * - 複数エラーの優先度
 * - エラーメッセージの一貫性
 *
 * エラーの種類:
 * - パラメータエラー: 無効コマンド、引数過多、無効な型
 * - オプションエラー: 無効オプション、制約違反、形式エラー
 */

import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../src/mod.ts';
import type { ParamsResult } from '../../src/mod.ts';

// ヘルパー関数: エラー結果の検証
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

  // パラメータエラー + 有効オプション
  const combinations = [
    // 無効コマンド + 有効オプション
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
    // 引数過多 + 有効オプション
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
    // 無効 demonstrativeType + 有効オプション
    {
      args: ['invalid', 'project', '--from=input.md'],
      expectedError: 'Invalid demonstrative type',
      expectedCode: 'INVALID_DEMONSTRATIVE_TYPE',
      description: 'Invalid demonstrative type with valid option',
    },
    {
      args: ['wrong_demo', 'issue', '--destination=output.md', '--input=task'],
      expectedError: 'Invalid demonstrative type',
      expectedCode: 'INVALID_DEMONSTRATIVE_TYPE',
      description: 'Invalid demonstrative type with multiple valid options',
    },
    // 無効 layerType + 有効オプション
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

  // パラメータエラー + 無効オプション（パラメータエラーが優先されるべき）
  const combinations = [
    // 無効コマンド + 無効オプション
    {
      args: ['unknown', '--invalid=value'],
      expectedError: 'Invalid command: unknown',
      expectedCode: 'INVALID_COMMAND',
      description: 'Invalid command with invalid option - command error should take precedence',
    },
    // 引数過多 + 無効オプション
    {
      args: ['to', 'project', 'extra', '--unknown=value'],
      expectedError: 'Too many arguments',
      expectedCode: 'TOO_MANY_ARGS',
      description: 'Too many arguments with invalid option - args error should take precedence',
    },
    // 無効 demonstrativeType + 無効オプション
    {
      args: ['invalid', 'project', '--nonexistent=value'],
      expectedError: 'Invalid demonstrative type',
      expectedCode: 'INVALID_DEMONSTRATIVE_TYPE',
      description:
        'Invalid demonstrative type with invalid option - param error should take precedence',
    },
    // 無効 layerType + 無効オプション
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

  // オプション制約違反の組み合わせ
  const combinations = [
    // OneParam + 複数無効オプション
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
    // ZeroParams + 複数無効オプション
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

  // 複数のエラー要因が同時に存在する場合の優先度テスト
  const combinations = [
    // 無効コマンド + 制約違反オプション
    {
      args: ['unknown', '--config=test'],
      expectedError: 'Invalid command: unknown',
      expectedCode: 'INVALID_COMMAND',
      description: 'Invalid command should take precedence over option constraint',
    },
    // 引数過多 + 無効オプション + 制約違反
    {
      args: ['to', 'project', 'extra', 'more', '--unknown=value', '--config=test'],
      expectedError: 'Too many arguments',
      expectedCode: 'TOO_MANY_ARGS',
      description: 'Parameter error should take precedence over option errors',
    },
    // 無効な demonstrativeType + layerType + オプション
    {
      args: ['invalid', 'also_invalid', '--nonexistent=value'],
      expectedError: 'Invalid demonstrative type',
      expectedCode: 'INVALID_DEMONSTRATIVE_TYPE',
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
      'Invalid demonstrative type',
      'INVALID_DEMONSTRATIVE_TYPE',
      'Empty option values with parameter error',
    );
  });

  await t.step('Special characters with parameter errors', () => {
    const args = ['@#$invalid', 'project', '--from=file@#$.md'];
    const result = parser.parse(args) as ParamsResult;

    assertErrorResult(
      result,
      'Invalid demonstrative type',
      'INVALID_DEMONSTRATIVE_TYPE',
      'Special characters with parameter error',
    );
  });

  await t.step('Very long parameters with option errors', () => {
    const longParam = 'x'.repeat(1000);
    const args = [longParam, 'project', '--unknown=value'];
    const result = parser.parse(args) as ParamsResult;

    assertErrorResult(
      result,
      'Invalid demonstrative type',
      'INVALID_DEMONSTRATIVE_TYPE',
      'Long parameter with option error',
    );
  });
});

Deno.test('Error Combinations - Mixed Form Errors', async (t) => {
  const parser = new ParamsParser();

  // 長短形式混合でのエラーケース
  const combinations = [
    // OneParam + 長短形式混合の無効オプション
    {
      args: ['init', '--config=test', '-f=input.md'],
      expectedError: 'Invalid options for one parameters',
      expectedCode: 'INVALID_OPTIONS',
      description: 'OneParam with mixed form invalid options',
    },
    // 無効パラメータ + 長短形式混合
    {
      args: ['invalid', 'project', '--from=input.md', '-o=output.md'],
      expectedError: 'Invalid demonstrative type',
      expectedCode: 'INVALID_DEMONSTRATIVE_TYPE',
      description: 'Invalid parameter with mixed form options',
    },
    // 引数過多 + ユーザー変数 + 長短形式
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

  // 同じ種類のエラーが一貫したメッセージを返すことを確認
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

  await t.step('Consistent invalid demonstrative type messages', () => {
    const invalidDemoTypes = ['invalid', 'wrong', 'bad', 'unknown'];

    for (const demoType of invalidDemoTypes) {
      const result = parser.parse([demoType, 'project']) as ParamsResult;

      assertEquals(result.type, 'error');
      assertStringIncludes(result.error?.message || '', 'Invalid demonstrative type');
      assertEquals(result.error?.code, 'INVALID_DEMONSTRATIVE_TYPE');
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
