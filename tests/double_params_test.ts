/**
 * 2パラメータのケースのテストスイート
 *
 * このテストファイルの目的：
 * 1. 指示語とレイヤータイプの組み合わせが正しく処理されることを確認
 * 2. オプションを含む場合の動作を検証
 * 3. オプションの短形式と長形式の両方が正しく動作することを確認
 *
 * 期待される動作：
 * - 指示語（to/summary/defect）とレイヤータイプ（project/issue/task）の
 *   すべての有効な組み合わせが正しく解析される
 * - オプション（--from, --destination, --input）が正しく処理される
 * - オプションの短形式（-f, -d, -i）が正しく処理される
 *
 * テストケースの構成：
 * 1. 基本的な組み合わせのテスト（to project, summary issue, defect task）
 * 2. オプション付きの組み合わせテスト
 * 3. オプションの短形式を使用したテスト
 *
 * 注意事項：
 * - レイヤータイプのエイリアスのテストは aliases_test.ts で行う
 * - エラーケースのテストは error_test.ts で行う
 */

import { assertEquals } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../src/params_parser.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('Double Parameters', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle basic combinations', () => {
    _logger.debug('Testing basic parameter combinations');
    const result = parser.parse(['to', 'project']);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {});
    }
  });

  await t.step('should handle different demonstrative types', () => {
    const testCases = [
      { args: ['summary', 'issue'], demonstrativeType: 'summary' },
      { args: ['defect', 'task'], demonstrativeType: 'defect' },
    ];

    for (const { args, demonstrativeType } of testCases) {
      _logger.debug('Testing demonstrative type', { args, demonstrativeType });
      const result = parser.parse(args);
      _logger.debug('Parse result', result);
      assertEquals(result.type, 'double');
      if (result.type === 'double') {
        assertEquals(result.demonstrativeType, demonstrativeType);
      }
    }
  });

  await t.step('should handle options', () => {
    _logger.debug('Testing option handling');
    const result = parser.parse([
      'to',
      'project',
      '--from',
      'input.txt',
      '--destination',
      'output.txt',
      '--input',
      'issue',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
        fromLayerType: 'issue',
      });
    }
  });

  await t.step('should handle short form options', () => {
    _logger.debug('Testing short form option handling');
    const result = parser.parse([
      'to',
      'project',
      '-f',
      'input.txt',
      '-o',
      'output.txt',
      '-i',
      'issue',
    ]);
    _logger.debug('Parse result', result);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
        fromLayerType: 'issue',
      });
    }
  });
});
