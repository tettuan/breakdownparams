/**
 * レイヤータイプエイリアスのテストスイート
 *
 * このテストファイルの目的：
 * 1. レイヤータイプのエイリアスが正しく解決されることを確認
 * 2. 大文字小文字を区別しない処理を検証
 * 3. オプション付きのエイリアス処理を確認
 *
 * 期待される動作：
 * - プロジェクトエイリアス（p, proj）が正しく解決される
 * - イシューエイリアス（i, iss）が正しく解決される
 * - タスクエイリアス（t, task）が正しく解決される
 * - 大文字小文字を区別しない処理が行われる
 * - オプション付きのエイリアスが正しく処理される
 *
 * テストケースの構成：
 * 1. プロジェクトエイリアスのテスト
 * 2. イシューエイリアスのテスト
 * 3. タスクエイリアスのテスト
 * 4. 大文字小文字を区別しないテスト
 * 5. オプション付きエイリアスのテスト
 *
 * 注意事項：
 * - エイリアスは大文字小文字を区別しない
 * - オプションはエイリアス解決後に適用される
 */

import { assertEquals } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../src/params_parser.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('Layer Type Aliases', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle project aliases', () => {
    _logger.debug('Testing project alias parsing');
    const result = parser.parse(['to', 'p']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {});
    }
  });

  await t.step('should handle issue aliases', () => {
    _logger.debug('Testing issue alias parsing');
    const result = parser.parse(['to', 'i']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'issue');
      assertEquals(result.options, {});
    }
  });

  await t.step('should handle task aliases', () => {
    _logger.debug('Testing task alias parsing');
    const result = parser.parse(['to', 't']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'task');
      assertEquals(result.options, {});
    }
  });

  await t.step('should handle case-insensitive aliases', () => {
    _logger.debug('Testing case-insensitive alias parsing');
    const result = parser.parse(['TO', 'P']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {});
    }
  });

  await t.step('should handle aliases with options', () => {
    _logger.debug('Testing alias with options parsing');
    const result = parser.parse(['to', 'p', '--from', 'input.txt']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
      });
    }
  });
});
