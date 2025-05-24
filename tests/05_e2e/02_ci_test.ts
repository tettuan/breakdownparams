/**
 * CI/CD改善のためのテストスイート
 *
 * このテストファイルの目的：
 * 1. パフォーマンステスト
 *    - 大量のカスタム変数オプションの処理時間
 *    - 複雑な正規表現パターンの処理時間
 * 2. セキュリティテスト
 *    - カスタム変数オプションの値の検証
 *    - 特殊文字や制御文字の処理
 *    - 長すぎる入力値の処理
 * 3. エッジケーステスト
 *    - 空の値を持つカスタム変数オプション
 *    - 重複するカスタム変数オプション名
 *    - 大文字小文字の混在したカスタム変数オプション名
 *
 * 注意事項：
 * - パフォーマンステストは環境によって結果が異なる可能性がある
 * - セキュリティテストは定期的に更新が必要
 * - エッジケースは新しいケースが発見されたら追加する
 */

import { assert, assertEquals, assertExists } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../../mod.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

// パフォーマンステスト
Deno.test('Performance Tests', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle large number of custom variables within time limit', () => {
    _logger.debug('Testing performance with large number of custom variables');
    const args = ['to', 'project'];
    // 100個のカスタム変数を生成（MAX_CUSTOM_VARIABLESの制限に合わせる）
    for (let i = 0; i < 100; i++) {
      args.push(`--uv-test${i}=value${i}`);
    }
    const start = performance.now();
    const result = parser.parse(args);
    const end = performance.now();
    const processingTime = end - start;

    _logger.debug('Processing time', { processingTime });
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assert(processingTime < 1000, `Processing took too long: ${processingTime}ms`);
      assertExists(result.options.customVariables);
      assertEquals(Object.keys(result.options.customVariables).length, 100);
    }
  });

  await t.step('should handle complex regex patterns efficiently', () => {
    _logger.debug('Testing performance with complex regex patterns');
    const parser = new ParamsParser({
      isExtendedMode: true,
      demonstrativeType: {
        pattern: '^[a-z]+(_[a-z]+)*$',
      },
      layerType: {
        pattern: '^[a-z]+(_[a-z]+)*$',
      },
    });
    const start = performance.now();
    const result = parser.parse(['complex_type_name', 'complex_layer_name']);
    const end = performance.now();
    const processingTime = end - start;

    _logger.debug('Processing time', { processingTime });
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assert(processingTime < 100, `Processing took too long: ${processingTime}ms`);
    }
  });
});

// セキュリティテスト
Deno.test('Security Tests', async (t) => {
  const parser = new ParamsParser();

  await t.step('should reject malicious custom variable values', () => {
    _logger.debug('Testing security with malicious custom variable values');
    const maliciousValues = [
      '--uv-test=malicious; rm -rf /',
      '--uv-test=malicious && rm -rf /',
      '--uv-test=malicious | rm -rf /',
      '--uv-test=malicious || rm -rf /',
      '--uv-test=malicious > /dev/null',
    ];

    for (const value of maliciousValues) {
      const result = parser.parse(['to', 'project', value]);
      assertEquals(result.type, 'double');
      if (result.type === 'double') {
        assertExists(result.error);
        assertEquals(result.error.code, 'SECURITY_ERROR');
      }
    }
  });

  await t.step('should handle control characters in custom variable values', () => {
    _logger.debug('Testing security with control characters');
    const controlChars = [
      '\x00',
      '\x01',
      '\x02',
      '\x03',
      '\x04',
      '\x05',
      '\x06',
      '\x07',
      '\x08',
      '\x09',
      '\x0A',
      '\x0B',
      '\x0C',
      '\x0D',
      '\x0E',
      '\x0F',
    ];

    for (const char of controlChars) {
      const result = parser.parse(['to', 'project', `--uv-test=value${char}`]);
      assertEquals(result.type, 'double');
      if (result.type === 'double') {
        assertExists(result.error);
        assertEquals(result.error.code, 'SECURITY_ERROR');
      }
    }
  });

  await t.step('should handle extremely long custom variable values', () => {
    _logger.debug('Testing security with long custom variable values');
    const longValue = 'a'.repeat(1001); // MAX_VALUE_LENGTH + 1
    const result = parser.parse(['to', 'project', `--uv-test=${longValue}`]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'VALUE_TOO_LONG');
    }
  });
});

// エッジケーステスト
Deno.test('Edge Cases', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle empty custom variable values', () => {
    _logger.debug('Testing edge case with empty custom variable values');
    const result = parser.parse(['to', 'project', '--uv-test=']);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.options.customVariables);
      assertEquals(result.options.customVariables.test, '');
    }
  });

  await t.step('should handle duplicate custom variable names', () => {
    _logger.debug('Testing edge case with duplicate custom variable names');
    const result = parser.parse([
      'to',
      'project',
      '--uv-test=value1',
      '--uv-test=value2',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.options.customVariables);
      assertEquals(result.options.customVariables.test, 'value2');
    }
  });

  await t.step('should handle mixed case custom variable names', () => {
    _logger.debug('Testing edge case with mixed case custom variable names');
    const result = parser.parse([
      'to',
      'project',
      '--uv-Test=value1',
      '--uv-test=value2',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.options.customVariables);
      assertEquals(result.options.customVariables.Test, 'value1');
      assertEquals(result.options.customVariables.test, 'value2');
    }
  });

  await t.step('should handle special characters in custom variable names', () => {
    _logger.debug('Testing edge case with special characters in custom variable names');
    const specialChars = [
      { option: '--uv-test-name=value', expectError: true },
      { option: '--uv-test_name=value', expectError: false },
      { option: '--uv-test.name=value', expectError: true },
    ];

    for (const { option, expectError } of specialChars) {
      const result = parser.parse(['to', 'project', option]);
      assertEquals(result.type, 'double');
      if (expectError) {
        assertExists(result.error);
        assertEquals(result.error.code, 'INVALID_CUSTOM_VARIABLE_NAME');
      } else if (result.type === 'double') {
        assert(!result.error);
        assertExists(result.options.customVariables);
      }
    }
  });
});
