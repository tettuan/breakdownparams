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

import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../src/params_parser.ts';

Deno.test('No Parameters', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle no parameters', () => {
    const result = parser.parse([]);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, false);
      assertEquals(result.version, false);
    }
  });

  await t.step('should handle help flag', () => {
    const result = parser.parse(['-h']);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, true);
      assertEquals(result.version, false);
    }
  });

  await t.step('should handle version flag', () => {
    const result = parser.parse(['-v']);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, false);
      assertEquals(result.version, true);
    }
  });

  await t.step('should handle both flags', () => {
    const result = parser.parse(['-h', '-v']);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, true);
      assertEquals(result.version, true);
    }
  });

  await t.step('should handle flags in any order', () => {
    const result = parser.parse(['-v', '-h']);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, true);
      assertEquals(result.version, true);
    }
  });
});
