/**
 * 複合的テスト: ユーザー変数マトリックステスト
 * 
 * このテストファイルは、ユーザー変数オプション（--uv-*）と標準オプションの
 * 組み合わせパターンを網羅的にテストします。
 * 
 * テスト対象:
 * - 標準オプション × ユーザー変数の組み合わせ
 * - 複数ユーザー変数の組み合わせ
 * - 特殊値・エッジケース値のテスト
 * - ユーザー変数の正規化テスト（--uv-config → uv-config）
 * - パフォーマンステスト（大量変数）
 * 
 * ユーザー変数の仕様:
 * - TwoParamsモードでのみ利用可能
 * - --uv-{name}={value} 形式
 * - 正規化後は uv-{name} として保存
 * - 名前に英数字、ハイフン、アンダースコアを許可
 */

import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { ParamsParser } from '../../src/mod.ts';
import type { TwoParamsResult, ParamsResult } from '../../src/mod.ts';

// テスト用の共通パラメータ
const DEMO_TYPE = 'to';
const LAYER_TYPE = 'project';

// ヘルパー関数: オプションの比較
function assertOptionsMatch(
  actual: Record<string, unknown>, 
  expected: Record<string, unknown>, 
  testDescription: string
) {
  for (const [key, expectedValue] of Object.entries(expected)) {
    assertEquals(
      actual[key], 
      expectedValue, 
      `${testDescription}: Option '${key}' should be '${expectedValue}' but was '${actual[key]}'`
    );
  }
}

// ヘルパー関数: 基本的な結果検証
function assertBasicResult(result: TwoParamsResult, testDescription: string) {
  assertEquals(result.type, 'two', `${testDescription}: Should be two params type`);
  assertEquals(result.demonstrativeType, DEMO_TYPE, `${testDescription}: Wrong demonstrative type`);
  assertEquals(result.layerType, LAYER_TYPE, `${testDescription}: Wrong layer type`);
}

Deno.test('User Variable Matrix - Standard Options + Single User Variable', async (t) => {
  const parser = new ParamsParser();
  
  // 標準オプション × 単一ユーザー変数の組み合わせ
  const combinations = [
    // from + user variable
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--uv-project=test'], 
      expected: { from: 'input.md', 'uv-project': 'test' },
      description: 'from + user variable'
    },
    // destination + user variable
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--destination=output.md', '--uv-version=1.0.0'], 
      expected: { destination: 'output.md', 'uv-version': '1.0.0' },
      description: 'destination + user variable'
    },
    // input + user variable
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--input=task', '--uv-environment=dev'], 
      expected: { input: 'task', 'uv-environment': 'dev' },
      description: 'input + user variable'
    },
    // adaptation + user variable
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--adaptation=strict', '--uv-mode=debug'], 
      expected: { adaptation: 'strict', 'uv-mode': 'debug' },
      description: 'adaptation + user variable'
    },
    // config + user variable
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--config=test', '--uv-env=prod'], 
      expected: { config: 'test', 'uv-env': 'prod' },
      description: 'config + user variable'
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
        `Standard + user variable ${i + 1}: ${testCase.description}`
      );
    });
  }
});

Deno.test('User Variable Matrix - Multiple Standard Options + Multiple User Variables', async (t) => {
  const parser = new ParamsParser();
  
  // 複数標準オプション × 複数ユーザー変数の組み合わせ
  const combinations = [
    // 2つずつの組み合わせ
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--destination=output.md', '--uv-project=test', '--uv-version=1.0.0'], 
      expected: { from: 'input.md', destination: 'output.md', 'uv-project': 'test', 'uv-version': '1.0.0' },
      description: '2 standard + 2 user variables'
    },
    // 3つずつの組み合わせ
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--input=task', '--config=test', '--uv-env=prod', '--uv-debug=true', '--uv-timeout=30'], 
      expected: { from: 'input.md', input: 'task', config: 'test', 'uv-env': 'prod', 'uv-debug': 'true', 'uv-timeout': '30' },
      description: '3 standard + 3 user variables'
    },
    // すべての標準オプション + 複数ユーザー変数
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--from=input.md', '--destination=output.md', '--input=task', '--adaptation=strict', '--config=test', '--uv-project=myproject', '--uv-version=1.0.0', '--uv-environment=production'], 
      expected: { from: 'input.md', destination: 'output.md', input: 'task', adaptation: 'strict', config: 'test', 'uv-project': 'myproject', 'uv-version': '1.0.0', 'uv-environment': 'production' },
      description: 'all standard + multiple user variables'
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
        `Multiple matrix ${i + 1}: ${testCase.description}`
      );
    });
  }
});

Deno.test('User Variable Matrix - Special Values', async (t) => {
  const parser = new ParamsParser();
  
  // 特殊値テストデータ
  const specialValueTests = [
    // JSON値
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-config={"key":"value","nested":{"array":[1,2,3]}}'], 
      expected: { 'uv-config': '{"key":"value","nested":{"array":[1,2,3]}}' },
      description: 'JSON-like value'
    },
    // パス値
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-path=/very/long/path/to/some/file/with/spaces'], 
      expected: { 'uv-path': '/very/long/path/to/some/file/with/spaces' },
      description: 'Path value'
    },
    // 特殊文字
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-special=value-with-hyphens_and_underscores'], 
      expected: { 'uv-special': 'value-with-hyphens_and_underscores' },
      description: 'Special characters in value'
    },
    // URL値（簡単なもの）
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-url=https://example.com/api'], 
      expected: { 'uv-url': 'https://example.com/api' },
      description: 'Simple URL value'
    },
    // 空値（数値テストの後に移動）
    // 数値
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-number=42', '--uv-float=3.14159'], 
      expected: { 'uv-number': '42', 'uv-float': '3.14159' },
      description: 'Numeric values'
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
        `Special value ${i + 1}: ${testCase.description}`
      );
    });
  }
});

Deno.test('User Variable Matrix - Variable Name Patterns', async (t) => {
  const parser = new ParamsParser();
  
  // 変数名パターンテスト
  const namePatternTests = [
    // 標準的な名前
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-project=test'], 
      expected: { 'uv-project': 'test' },
      description: 'Standard name with hyphen'
    },
    // アンダースコア
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-project_name=test'], 
      expected: { 'uv-project_name': 'test' },
      description: 'Name with underscore'
    },
    // 数字含み
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-version2=test'], 
      expected: { 'uv-version2': 'test' },
      description: 'Name with number'
    },
    // 複合パターン
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-my_project_v2=test'], 
      expected: { 'uv-my_project_v2': 'test' },
      description: 'Complex name pattern'
    },
    // 長い名前
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '--uv-very_long_variable_name_with_many_words=test'], 
      expected: { 'uv-very_long_variable_name_with_many_words': 'test' },
      description: 'Very long variable name'
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
        `Name pattern ${i + 1}: ${testCase.description}`
      );
    });
  }
});

Deno.test('User Variable Matrix - Performance Test', async (t) => {
  const parser = new ParamsParser();
  
  await t.step('Many user variables (performance test)', () => {
    // 20個のユーザー変数を作成
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
      'Performance test with 20 user variables'
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
      'Performance test with 1000-character value'
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
      'Should reject user variables in OneParam mode'
    );
  });
  
  await t.step('User variables in ZeroParams mode should error', () => {
    const args = ['--help', '--uv-test=value'];
    const result = parser.parse(args) as ParamsResult;
    
    assertEquals(result.type, 'error');
    assertStringIncludes(
      result.error?.message || '', 
      'Invalid options for zero parameters',
      'Should reject user variables in ZeroParams mode'
    );
  });
  
  await t.step('User variables with empty values should error', () => {
    const args = [DEMO_TYPE, LAYER_TYPE, '--uv-empty='];
    const result = parser.parse(args) as ParamsResult;
    
    assertEquals(result.type, 'error');
    assertStringIncludes(
      result.error?.message || '', 
      'Empty value not allowed',
      'Should reject empty user variable values'
    );
  });
  
  await t.step('User variables with complex URL values should error', () => {
    const args = [DEMO_TYPE, LAYER_TYPE, '--uv-url=https://example.com/api/v1/endpoint?param=value&other=123'];
    const result = parser.parse(args) as ParamsResult;
    
    assertEquals(result.type, 'error');
    // URLの複雑な文字が問題となる可能性があるのでエラーが発生することを確認
    assertEquals(result.type, 'error', 'Complex URL should result in error');
  });
});

Deno.test('User Variable Matrix - Mixed with Short Forms', async (t) => {
  const parser = new ParamsParser();
  
  // 短形式オプション + ユーザー変数の組み合わせ
  const combinations = [
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '-f=input.md', '--uv-project=test'], 
      expected: { from: 'input.md', 'uv-project': 'test' },
      description: 'Short form + user variable'
    },
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '-f=input.md', '-o=output.md', '--uv-env=prod', '--uv-debug=true'], 
      expected: { from: 'input.md', destination: 'output.md', 'uv-env': 'prod', 'uv-debug': 'true' },
      description: 'Multiple short forms + user variables'
    },
    { 
      args: [DEMO_TYPE, LAYER_TYPE, '-f=input.md', '--destination=output.md', '-i=task', '--uv-project=test', '-c=config'], 
      expected: { from: 'input.md', destination: 'output.md', input: 'task', 'uv-project': 'test', config: 'config' },
      description: 'Mixed short/long forms + user variable'
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
        `Mixed short form ${i + 1}: ${testCase.description}`
      );
    });
  }
});