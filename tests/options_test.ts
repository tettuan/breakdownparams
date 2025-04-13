/**
 * オプションのテストスイート
 *
 * このテストファイルの目的：
 * 1. オプションの長形式と短形式が正しく処理されることを確認
 * 2. オプションの組み合わせが正しく動作することを検証
 * 3. オプションの優先順位が正しく適用されることを確認
 *
 * 期待される動作：
 * - 長形式のオプション（--from, --destination, --input）が正しく処理される
 * - 短形式のオプション（-f, -o, -i）が正しく処理される
 * - 長形式が短形式より優先される
 * - オプションの組み合わせが正しく処理される
 *
 * テストケースの構成：
 * 1. 長形式オプションのテスト
 * 2. 短形式オプションのテスト
 * 3. オプションの組み合わせテスト
 * 4. オプションの優先順位テスト
 *
 * 注意事項：
 * - オプションの順序は結果に影響しない
 * - 同じオプションが複数回指定された場合、最後の指定が有効
 */

import { assertEquals } from '@std/assert';
import { ParamsParser } from '../src/params_parser.ts';

Deno.test('Options', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle long form options', () => {
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

  await t.step('should handle mixed form options', () => {
    const result = parser.parse([
      'to',
      'project',
      '--from',
      'input.txt',
      '-o',
      'output.txt',
      '--input',
      'issue',
    ]);
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

  await t.step('should prioritize long form over short form', () => {
    const result = parser.parse([
      'to',
      'project',
      '--from',
      'long.txt',
      '-f',
      'short.txt',
      '--destination',
      'long.txt',
      '-o',
      'short.txt',
      '--input',
      'project',
      '-i',
      'task',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'long.txt',
        destinationFile: 'long.txt',
        fromLayerType: 'project',
      });
    }
  });
});
