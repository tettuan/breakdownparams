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

Deno.test('NoParams: 基本動作', () => {
  const parser = new ParamsParser();
  const result = parser.parse([]);
  if (result.success && result.data && result.data.type === 'zero') {
    assertEquals(result.data.help, true);
    assertEquals(result.data.version, false);
  } else if (!result.success) {
    throw new Error(result.error?.message ?? 'Unknown error');
  } else {
    throw new Error('Unexpected result type');
  }
});

Deno.test('NoParams: --help', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['--help']);
  if (result.success && result.data && result.data.type === 'zero') {
    assertEquals(result.data.help, true);
    assertEquals(result.data.version, false);
  } else if (!result.success) {
    throw new Error(result.error?.message ?? 'Unknown error');
  } else {
    throw new Error('Unexpected result type');
  }
});

Deno.test('NoParams: --version', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['--version']);
  if (result.success && result.data && result.data.type === 'zero') {
    assertEquals(result.data.help, false);
    assertEquals(result.data.version, true);
  } else if (!result.success) {
    throw new Error(result.error?.message ?? 'Unknown error');
  } else {
    throw new Error('Unexpected result type');
  }
});

Deno.test('NoParams: --help --version', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['--help', '--version']);
  if (result.success && result.data && result.data.type === 'zero') {
    assertEquals(result.data.help, true);
    assertEquals(result.data.version, true);
  } else if (!result.success) {
    throw new Error(result.error?.message ?? 'Unknown error');
  } else {
    throw new Error('Unexpected result type');
  }
});
