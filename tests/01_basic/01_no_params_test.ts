/**
 * パラメータなしのテストスイート
 *
 * このテストファイルの目的：
 * 1. パラメータなしで実行された場合の動作を確認
 * 2. ヘルプフラグ（-h, --help）の処理を確認
 * 3. バージョンフラグ（-v, --version）の処理を確認
 * 4. フラグの組み合わせと順序の処理を確認
 *
 * 期待される動作：
 * - パラメータなしの場合は空の結果を返す
 * - ヘルプフラグが正しく処理される
 * - バージョンフラグが正しく処理される
 * - フラグは任意の順序で指定可能
 *
 * テストケースの構成：
 * 1. パラメータなしのテスト
 * 2. ヘルプフラグのテスト
 * 3. バージョンフラグのテスト
 * 4. フラグ組み合わせのテスト
 * 5. フラグ順序のテスト
 *
 * 注意事項：
 * - フラグは任意の順序で指定可能
 * - フラグは複数同時に指定可能
 * - フラグの値は大文字小文字を区別しない
 */

import { assertEquals } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../../mod.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('No Parameters', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle no parameters', () => {
    _logger.debug('Testing no parameters handling');
    const result = parser.parse([]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, false);
      assertEquals(result.version, false);
    }
  });

  await t.step('should handle help flag', () => {
    _logger.debug('Testing help flag handling');
    const result = parser.parse(['-h']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, true);
      assertEquals(result.version, false);
    }
  });

  await t.step('should handle version flag', () => {
    _logger.debug('Testing version flag handling');
    const result = parser.parse(['-v']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, false);
      assertEquals(result.version, true);
    }
  });

  await t.step('should handle both flags', () => {
    _logger.debug('Testing both flags handling');
    const result = parser.parse(['-h', '-v']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, true);
      assertEquals(result.version, true);
    }
  });

  await t.step('should handle flags in any order', () => {
    _logger.debug('Testing flag order handling');
    const result = parser.parse(['-v', '-h']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, true);
      assertEquals(result.version, true);
    }
  });
});
