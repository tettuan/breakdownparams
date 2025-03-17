/**
 * オプション処理のテストスイート
 * 
 * このテストファイルの目的：
 * 1. オプションの個別処理が正しく行われることを確認
 * 2. 複数オプションの組み合わせが正しく処理されることを検証
 * 3. オプションの順序に依存しない処理を確認
 * 4. 短形式と長形式の混在したケースの処理を確認
 * 
 * 期待される動作：
 * - 個別オプション：各オプション（from/destination/input）が単独で正しく処理される
 * - 複数オプション：すべてのオプションが同時に指定された場合も正しく処理される
 * - オプション順序：オプションの指定順序が結果に影響を与えない
 * - 形式混在：短形式と長形式が混在しても正しく処理される
 * 
 * テストケースの構成：
 * 1. 単一オプションのテスト（from/destination/input）
 * 2. 全オプション同時指定のテスト
 * 3. オプション順序変更のテスト
 * 4. 短形式・長形式混在のテスト
 * 
 * 注意事項：
 * - オプション値の検証は error_test.ts で行う
 * - コマンドとの組み合わせは各コマンドのテストファイルで行う
 */

import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { DoubleParamsResult } from "../src/types.ts";

Deno.test("Options", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle from option only", () => {
    const result = parser.parse([
      "to",
      "project",
      "--from",
      "input.txt"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt"
      }
    });
  });

  await t.step("should handle destination option only", () => {
    const result = parser.parse([
      "to",
      "project",
      "--destination",
      "output.txt"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        destinationFile: "output.txt"
      }
    });
  });

  await t.step("should handle input option only", () => {
    const result = parser.parse([
      "to",
      "project",
      "--input",
      "task"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromLayerType: "task"
      }
    });
  });

  await t.step("should handle all options together", () => {
    const result = parser.parse([
      "to",
      "project",
      "--from",
      "input.txt",
      "--destination",
      "output.txt",
      "--input",
      "task"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt",
        destinationFile: "output.txt",
        fromLayerType: "task"
      }
    });
  });

  await t.step("should handle options in different order", () => {
    const result = parser.parse([
      "--from",
      "input.txt",
      "to",
      "project",
      "--destination",
      "output.txt"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt",
        destinationFile: "output.txt"
      }
    });
  });

  await t.step("should handle mixed long and short form options", () => {
    const result = parser.parse([
      "to",
      "project",
      "--from",
      "input.txt",
      "-o",
      "output.txt",
      "-i",
      "task"
    ]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {
        fromFile: "input.txt",
        destinationFile: "output.txt",
        fromLayerType: "task"
      }
    });
  });
}); 