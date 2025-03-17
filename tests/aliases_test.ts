/**
 * レイヤータイプのエイリアス処理のテストスイート
 * 
 * このテストファイルの目的：
 * 1. レイヤータイプの各エイリアスが正しく解決されることを確認
 * 2. 大文字小文字の区別なく処理されることを検証
 * 3. オプションと組み合わせた場合の動作を確認
 * 
 * 期待される動作：
 * - プロジェクトエイリアス：project, pj, prj が同じレイヤータイプに解決される
 * - イシューエイリアス：issue, story が同じレイヤータイプに解決される
 * - タスクエイリアス：task, todo, chore, style, fix, error, bug が
 *   同じレイヤータイプに解決される
 * - 大文字小文字：異なる大文字小文字でも正しく解決される
 * - オプション組み合わせ：エイリアスとオプションが共存できる
 * 
 * テストケースの構成：
 * 1. プロジェクトエイリアスのテスト
 * 2. イシューエイリアスのテスト
 * 3. タスクエイリアスのテスト
 * 4. 大文字小文字の区別なしテスト
 * 5. オプション付きエイリアスのテスト
 * 
 * 注意事項：
 * - 無効なエイリアスのテストは error_test.ts で行う
 * - エイリアスの組み合わせテストは double_params_test.ts で行う
 */

import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { DoubleParamsResult } from "../src/types.ts";

Deno.test("Layer Type Aliases", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle project aliases", () => {
    const aliases = ["project", "pj", "prj"];
    for (const alias of aliases) {
      const result = parser.parse(["to", alias]) as DoubleParamsResult;
      assertEquals(result, {
        type: "double",
        demonstrativeType: "to",
        layerType: "project",
        options: {}
      });
    }
  });

  await t.step("should handle issue aliases", () => {
    const aliases = ["issue", "story"];
    for (const alias of aliases) {
      const result = parser.parse(["to", alias]) as DoubleParamsResult;
      assertEquals(result, {
        type: "double",
        demonstrativeType: "to",
        layerType: "issue",
        options: {}
      });
    }
  });

  await t.step("should handle task aliases", () => {
    const aliases = ["task", "todo", "chore", "style", "fix", "error", "bug"];
    for (const alias of aliases) {
      const result = parser.parse(["to", alias]) as DoubleParamsResult;
      assertEquals(result, {
        type: "double",
        demonstrativeType: "to",
        layerType: "task",
        options: {}
      });
    }
  });

  await t.step("should handle case-insensitive aliases", () => {
    const result = parser.parse(["to", "PJ"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle aliases with options", () => {
    const result = parser.parse([
      "to",
      "pj",
      "--from",
      "input.txt",
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
}); 