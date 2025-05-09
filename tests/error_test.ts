/**
 * エラーケースのテストスイート
 *
 * このテストファイルの目的：
 * 1. 無効なdemonstrativeTypeが指定された場合のエラー処理を確認
 * 2. 無効なlayerTypeが指定された場合のエラー処理を確認
 * 3. パラメータが多すぎる場合のエラー処理を確認
 * 4. 無効なコマンドが指定された場合のエラー処理を確認
 *
 * 期待される動作：
 * - 無効なdemonstrativeTypeは適切なエラーメッセージを返す
 * - 無効なlayerTypeは適切なエラーメッセージを返す
 * - パラメータが多すぎる場合は適切なエラーメッセージを返す
 * - 無効なコマンドは適切なエラーメッセージを返す
 *
 * テストケースの構成：
 * 1. 無効なdemonstrativeTypeのテスト
 * 2. 無効なlayerTypeのテスト
 * 3. パラメータ過多のテスト
 * 4. 無効なコマンドのテスト
 *
 * 注意事項：
 * - エラーメッセージは具体的で、ユーザーが問題を特定できる必要がある
 * - エラーメッセージには許可される値の一覧を含める
 * - エラーが発生しても、パースは継続される
 */

import { assertEquals, assertExists } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../src/params_parser.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('Error Cases', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle invalid demonstrative type', () => {
    _logger.debug('Testing invalid demonstrative type handling');
    const result = parser.parse(['invalid', 'issue']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(
        result.error,
        'Invalid demonstrative type: invalid. Must be one of: to, summary, defect',
      );
    }
  });

  await t.step('should handle invalid layer type', () => {
    _logger.debug('Testing invalid layer type handling');
    const result = parser.parse(['to', 'invalid']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error, 'Invalid layer type: invalid');
    }
  });

  await t.step('should handle too many parameters', () => {
    _logger.debug('Testing too many parameters handling');
    const result = parser.parse(['to', 'issue', 'extra']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertExists(result.error);
      assertEquals(
        result.error,
        'Too many arguments. Maximum 2 arguments are allowed.',
      );
    }
  });

  await t.step('should handle invalid command', () => {
    _logger.debug('Testing invalid command handling');
    const result = parser.parse(['invalid']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertExists(result.error);
      assertEquals(result.error, 'Invalid command: invalid');
    }
  });
});
