import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ParamsParser } from '../../mod.ts';
import { ERROR_CODES, ERROR_CATEGORIES } from '../../src/core/errors/constants.ts';
import { ParamPatternResult, ParseResult } from '../../src/core/params/definitions/types.ts';

/**
 * ParamsParserのテストスイート
 *
 * 目的: コマンドライン引数の解析とバリデーション機能を検証
 * 背景:
 * - CLIツールの引数解析は、ユーザー入力の最初の窓口として重要
 * - 誤った入力に対する適切なエラーハンドリングが必要
 * - エイリアスやオプションの組み合わせなど、複雑な入力パターンに対応する必要がある
 *
 * テストの構成:
 * 1. パラメータなしのケース（help/versionフラグ）
 * 2. 単一パラメータのケース（initコマンド）
 * 3. 2パラメータのケース（demonstrativeTypeとlayerType）
 * 4. オプションの処理
 * 5. エラーケースの処理
 *
 * テストの成功定義:
 * - 仕様書（docs/index.ja.md）に記載された全ての要件を満たすこと
 * - 設計書（docs/development.ja.md）に記載された設計原則に従うこと
 * - エラーケースで適切なメッセージを返すこと
 * - エイリアスと大文字小文字の扱いが仕様通りであること
 */

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('ParamsParser', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle no parameters', () => {
    const result = parser.parse([]);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'zero') {
      assertEquals(result.data.help, true);
      assertEquals(result.data.version, false);
    }
  });

  await t.step('should handle no parameters with version flag', () => {
    const result = parser.parse(['--version']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'zero') {
      assertEquals(result.data.help, false);
      assertEquals(result.data.version, true);
    }
  });

  await t.step('should handle no parameters with help and version flags', () => {
    const result = parser.parse(['--help', '--version']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'zero') {
      assertEquals(result.data.help, true);
      assertEquals(result.data.version, true);
    }
  });

  await t.step('should handle single parameter', () => {
    const result = parser.parse(['init']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'one') {
      assertEquals(result.data.command, 'init');
    }
  });

  await t.step('should handle single parameter with options', () => {
    const result = parser.parse(['init', '--config=config.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'one') {
      assertEquals(result.data.command, 'init');
    }
  });

  await t.step('should handle two parameters', () => {
    const result = parser.parse(['to', 'issue']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'two') {
      assertEquals(result.data.demonstrativeType, 'to');
      assertEquals(result.data.layerType, 'issue');
      assertEquals(result.data.options, {});
    }
  });

  await t.step('should handle two parameters with different demonstrative type', () => {
    const result = parser.parse(['summary', 'issue']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'two') {
      assertEquals(result.data.demonstrativeType, 'summary');
      assertEquals(result.data.layerType, 'issue');
      assertEquals(result.data.options, {});
    }
  });

  await t.step('should handle two parameters with options', () => {
    const result = parser.parse(['to', 'issue', '--from=test.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'two') {
      assertEquals(result.data.demonstrativeType, 'to');
      assertEquals(result.data.layerType, 'issue');
      assertEquals(result.data.options.fromFile, 'test.json');
    }
  });

  await t.step('should handle two parameters with multiple options', () => {
    const result = parser.parse(['to', 'issue', '--from=test.json', '--destination=output.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'two') {
      assertEquals(result.data.demonstrativeType, 'to');
      assertEquals(result.data.layerType, 'issue');
      assertEquals(result.data.options.fromFile, 'test.json');
      assertEquals(result.data.options.destinationFile, 'output.json');
    }
  });

  await t.step('should handle two parameters with short options', () => {
    const result = parser.parse(['to', 'issue', '-f=test.json', '-o=output.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertExists(result.data);
    if (result.data.type === 'two') {
      assertEquals(result.data.demonstrativeType, 'to');
      assertEquals(result.data.layerType, 'issue');
      assertEquals(result.data.options.fromFile, 'test.json');
      assertEquals(result.data.options.destinationFile, 'output.json');
    }
  });

  await t.step('should handle invalid command', () => {
    const result = parser.parse(['invalid']);
    assertExists(result);
    assertEquals(result.success, false);
    assertExists(result.error);
    assertEquals(result.error.code, ERROR_CODES.VALIDATION_ERROR);
    assertEquals(result.error.category, ERROR_CATEGORIES.VALIDATION);
  });

  await t.step('should handle invalid demonstrative type', () => {
    const result = parser.parse(['invalid', 'issue']);
    assertExists(result);
    assertEquals(result.success, false);
    assertExists(result.error);
    assertEquals(result.error.code, ERROR_CODES.VALIDATION_ERROR);
    assertEquals(result.error.category, ERROR_CATEGORIES.VALIDATION);
  });

  await t.step('should handle invalid layer type', () => {
    const result = parser.parse(['to', 'invalid']);
    assertExists(result);
    assertEquals(result.success, false);
    assertExists(result.error);
    assertEquals(result.error.code, ERROR_CODES.VALIDATION_ERROR);
    assertEquals(result.error.category, ERROR_CATEGORIES.VALIDATION);
  });

  await t.step('should handle too many arguments', () => {
    const result = parser.parse(['to', 'issue', 'extra']);
    assertExists(result);
    assertEquals(result.success, false);
    assertExists(result.error);
    assertEquals(result.error.code, ERROR_CODES.VALIDATION_ERROR);
    assertEquals(result.error.category, ERROR_CATEGORIES.VALIDATION);
  });
});
