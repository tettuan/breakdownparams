/**
 * パラメータなしのケースのテストスイート
 * 
 * このテストファイルの目的：
 * 1. コマンドライン引数が提供されない場合の基本的な動作を確認
 * 2. ヘルプオプションとバージョンオプションの処理を検証
 * 3. オプションの短形式と長形式の両方が正しく動作することを確認
 * 
 * 期待される動作：
 * - 引数なし：デフォルトの NoParamsResult を返す
 * - ヘルプオプション：help フラグを true に設定
 * - バージョンオプション：version フラグを true に設定
 * - 複数オプション：両方のフラグを適切に設定
 */

import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { NoParamsResult } from "../src/types.ts";

Deno.test("No Parameters", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle empty arguments", () => {
    const result = parser.parse([]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false
    });
  });

  await t.step("should handle help option with long form", () => {
    const result = parser.parse(["--help"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: true,
      version: false
    });
  });

  await t.step("should handle help option with short form", () => {
    const result = parser.parse(["-h"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: true,
      version: false
    });
  });

  await t.step("should handle version option with long form", () => {
    const result = parser.parse(["--version"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: true
    });
  });

  await t.step("should handle version option with short form", () => {
    const result = parser.parse(["-v"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: true
    });
  });

  await t.step("should handle both help and version options", () => {
    const result = parser.parse(["-h", "--version"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: true,
      version: true
    });
  });
}); 