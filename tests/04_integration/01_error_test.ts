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
import { ParamsParser } from '../../mod.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../../src/core/errors/constants.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('Error Cases', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle invalid demonstrative type', () => {
    _logger.debug('Testing invalid demonstrative type handling');
    const result = parser.parse(['invalid', 'issue']);
    _logger.debug('Parse result', result);
    assertEquals(result.data?.type, 'two');
    if (result.data?.type === 'two') {
      assertExists(result.error);
      assertEquals(result.error.code, 'VALIDATION_ERROR');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Invalid demonstrative type: invalid',
      );
    }
  });

  await t.step('should handle invalid layer type', () => {
    _logger.debug('Testing invalid layer type handling');
    const result = parser.parse(['to', 'invalid']);
    _logger.debug('Parse result', result);
    assertEquals(result.data?.type, 'two');
    if (result.data?.type === 'two') {
      assertExists(result.error);
      assertEquals(result.error.code, 'VALIDATION_ERROR');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Invalid layer type: invalid',
      );
    }
  });

  await t.step('should handle too many parameters', () => {
    _logger.debug('Testing too many parameters handling');
    const result = parser.parse(['to', 'issue', 'extra']);
    _logger.debug('Parse result', result);
    assertEquals(result.data?.type, 'zero');
    if (result.data?.type === 'zero') {
      assertExists(result.error);
      assertEquals(result.error.code, 'VALIDATION_ERROR');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Too many arguments. Maximum 2 arguments are allowed.',
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, 3);
      assertEquals(result.error.details.maxAllowed, 2);
    }
  });

  await t.step('should handle invalid command', () => {
    _logger.debug('Testing invalid command handling');
    const result = parser.parse(['invalid']);
    _logger.debug('Parse result', result);
    assertEquals(result.data?.type, 'one');
    if (result.data?.type === 'one') {
      assertExists(result.error);
      assertEquals(result.error.code, 'VALIDATION_ERROR');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Invalid command: invalid. Must be one of: init',
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, 'invalid');
      assertEquals(result.error.details.validCommands, ['init']);
    }
  });

  await t.step('should handle security error for forbidden characters', () => {
    _logger.debug('Testing security error handling');
    const result = parser.parse(['to;', 'project']);
    _logger.debug('Parse result', result);
    assertEquals(result.data?.type, 'two');
    if (result.data?.type === 'two') {
      assertExists(result.error);
      assertEquals(result.error.code, 'SECURITY_ERROR');
      assertEquals(result.error.category, 'SECURITY');
      assertEquals(
        result.error.message,
        'Security violation: Command injection attempt detected',
      );
    }
  });

  await t.step('should handle missing value for option', () => {
    const result = parser.parse(['to', 'project', '--from']);
    assertExists(result);
    assertEquals(result.success, false);
    assertEquals(result.error?.code, ERROR_CODES.INVALID_OPTION);
    assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
  });

  await t.step('should handle unknown option', async (t) => {
    await t.step('Testing unknown option handling', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['to', 'project', '--unknown']);
      assertEquals(result.data?.type, 'two');
      if (result.data?.type === 'two') {
        assertExists(result.error);
        assertEquals(result.error.code, 'UNKNOWN_OPTION');
        assertEquals(result.error.category, 'VALIDATION');
        assertEquals(result.error.message, 'Unknown option: --unknown');
      }
    });
  });

  await t.step('should handle invalid custom variable name', () => {
    _logger.debug('Testing invalid custom variable name handling');
    const result = parser.parse(['to', 'project', '--uv-']);
    _logger.debug('Parse result', result);
    assertEquals(result.data?.type, 'two');
    if (result.data?.type === 'two') {
      assertExists(result.error);
      assertEquals(result.error.code, 'INVALID_CUSTOM_VARIABLE');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Invalid custom variable name: --uv-',
      );
    }
  });

  await t.step('should handle missing value for custom variable', () => {
    _logger.debug('Testing missing value for custom variable handling');
    const result = parser.parse(['to', 'project', '--uv-name']);
    _logger.debug('Parse result', result);
    assertEquals(result.data?.type, 'two');
    if (result.data?.type === 'two') {
      assertExists(result.error);
      assertEquals(result.error.code, 'MISSING_OPTION_VALUE');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        'Missing value for custom variable: --uv-name',
      );
    }
  });
});
