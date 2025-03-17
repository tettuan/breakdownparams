/**
 * 単一パラメータのケースのテストスイート
 * 
 * このテストファイルの目的：
 * 1. 単一コマンド（init）の処理が正しく行われることを確認
 * 2. 無効なコマンドが適切にエラーとして処理されることを検証
 * 3. オプションと組み合わせた場合の動作を確認
 * 
 * 期待される動作：
 * - init コマンド：SingleParamResult を返し、command が "init" に設定される
 * - 無効なコマンド：エラーメッセージを含む ParamsResult を返す
 * - オプション付きコマンド：コマンドとオプションの両方が正しく解析される
 * 
 * テストケースの構成：
 * 1. 基本的な init コマンドのテスト
 * 2. オプション付き init コマンドのテスト
 * 3. 無効なコマンドのエラー処理テスト
 * 4. オプション付き無効なコマンドのテスト
 */

import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { NoParamsResult, SingleParamResult } from "../src/types.ts";

Deno.test("Single Parameter", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle init command", () => {
    const result = parser.parse(["init"]) as SingleParamResult;
    assertEquals(result, {
      type: "single",
      command: "init"
    });
  });

  await t.step("should handle init command with options", () => {
    const result = parser.parse(["init", "--help"]) as SingleParamResult;
    assertEquals(result, {
      type: "single",
      command: "init"
    });
  });

  await t.step("should handle invalid command", () => {
    const result = parser.parse(["invalid"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid command: invalid"
    });
  });

  await t.step("should handle invalid command with options", () => {
    const result = parser.parse(["invalid", "--help"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid command: invalid"
    });
  });
}); 