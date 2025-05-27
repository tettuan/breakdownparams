/**
 * 単一パラメータのテストスイート
 *
 * このテストファイルの目的：
 * 1. 単一パラメータのコマンドが正しく処理されることを確認
 * 2. オプション付きの単一パラメータコマンドを検証
 * 3. 無効なコマンドのエラー処理を確認
 *
 * 期待される動作：
 * - initコマンドが正しく処理される
 * - initコマンドにオプションを付けた場合も正しく処理される
 * - 無効なコマンドは適切なエラーメッセージを返す
 * - オプション付きの無効なコマンドも適切にエラー処理される
 *
 * テストケースの構成：
 * 1. initコマンドのテスト
 * 2. オプション付きinitコマンドのテスト
 * 3. 無効なコマンドのテスト
 * 4. オプション付き無効なコマンドのテスト
 *
 * 注意事項：
 * - 無効なコマンドは"single"タイプを返す
 * - エラーメッセージは具体的な内容を含む
 */

import { assertEquals, assertExists } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../../mod.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../../src/core/errors/constants.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('Single Parameter Tests', async (t) => {
  const parser = new ParamsParser();

  await t.step('should parse init command', () => {
    _logger.debug('Testing init command parsing');
    const result = parser.parse(['init']);
    _logger.debug('Parse result', result);
    if (result.success && result.data && result.data.type === 'one') {
      assertEquals(result.data.command, 'init');
      assertEquals(result.data.options, {});
    } else if (!result.success) {
      throw new Error(result.error?.message ?? 'Unknown error');
    } else {
      throw new Error('Unexpected result type');
    }
  });

  await t.step('should parse init command with options', () => {
    _logger.debug('Testing init command with options');
    const result = parser.parse(['init', '--from=input.txt', '--destination=output.txt']);
    _logger.debug('Parse result', result);
    if (result.success && result.data && result.data.type === 'one') {
      assertEquals(result.data.command, 'init');
      assertEquals(result.data.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
      });
    } else if (!result.success) {
      throw new Error(result.error?.message ?? 'Unknown error');
    } else {
      throw new Error('Unexpected result type');
    }
  });

  await t.step('should parse init command with short options', () => {
    _logger.debug('Testing init command with short options');
    const result = parser.parse(['init', '-f=input.txt', '-o=output.txt']);
    _logger.debug('Parse result', result);
    if (result.success && result.data && result.data.type === 'one') {
      assertEquals(result.data.command, 'init');
      assertEquals(result.data.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
      });
    } else if (!result.success) {
      throw new Error(result.error?.message ?? 'Unknown error');
    } else {
      throw new Error('Unexpected result type');
    }
  });

  await t.step('should handle invalid command', () => {
    _logger.debug('Testing invalid command handling');
    const result = parser.parse(['invalid']);
    _logger.debug('Parse result', result);
    if (!result.success) {
      assertExists(result.error);
      assertEquals(result.error.code, ERROR_CODES.VALIDATION_ERROR);
      assertEquals(result.error.category, ERROR_CATEGORIES.VALIDATION);
      assertEquals(
        result.error.message,
        'Invalid command: invalid. Must be one of: init',
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, 'invalid');
      assertEquals(result.error.details.validCommands, ['init']);
    } else {
      throw new Error('Expected error result');
    }
  });

  await t.step('should handle invalid command with options', () => {
    _logger.debug('Testing invalid command with options');
    const result = parser.parse(['invalid', '--from=input.txt']);
    _logger.debug('Parse result', result);
    if (!result.success) {
      assertExists(result.error);
      assertEquals(result.error.code, ERROR_CODES.VALIDATION_ERROR);
      assertEquals(result.error.category, ERROR_CATEGORIES.VALIDATION);
      assertEquals(
        result.error.message,
        'Invalid command: invalid. Must be one of: init',
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, 'invalid');
      assertEquals(result.error.details.validCommands, ['init']);
    } else {
      throw new Error('Expected error result');
    }
  });
});
