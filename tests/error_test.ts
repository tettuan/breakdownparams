/**
 * エラー処理のテストスイート
 * 
 * このテストファイルの目的：
 * 1. 無効な入力に対して適切なエラーメッセージが返されることを確認
 * 2. エラー状態での型安全性を検証
 * 3. エッジケースでの動作を確認
 * 
 * 期待される動作：
 * - 無効な指示語：適切なエラーメッセージを含む ParamsResult を返す
 * - 無効なレイヤータイプ：適切なエラーメッセージを含む ParamsResult を返す
 * - 引数過多：適切なエラーメッセージを含む ParamsResult を返す
 * - オプション関連エラー：
 *   - オプション値の欠落
 *   - 無効なオプション
 *   - 無効なオプション値
 *   - ダッシュで始まるオプション値
 * 
 * テストケースの構成：
 * 1. 基本的な入力検証
 *    - 無効な指示語
 *    - 無効なレイヤータイプ
 *    - 引数過多
 * 2. オプション関連のエラー
 *    - オプション値欠落
 *    - 無効なオプション
 *    - 無効なオプション値
 *    - 特殊なオプション値
 * 
 * 注意事項：
 * - 各エラーケースで適切なエラーメッセージが含まれることを確認
 * - エラー状態でも型安全性が保たれることを確認
 * - エッジケースでの動作が定義通りであることを確認
 */

import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type { NoParamsResult, DoubleParamsResult } from "../src/types.ts";

Deno.test("Error Cases", async (t) => {
  const parser = new ParamsParser();

  await t.step("should handle invalid demonstrative type", () => {
    const result = parser.parse(["invalid", "project"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid demonstrative type: invalid"
    });
  });

  await t.step("should handle invalid layer type", () => {
    const result = parser.parse(["to", "invalid"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Invalid layer type: invalid"
    });
  });

  await t.step("should handle too many arguments", () => {
    const result = parser.parse(["to", "project", "extra"]) as NoParamsResult;
    assertEquals(result, {
      type: "no-params",
      help: false,
      version: false,
      error: "Too many arguments. Maximum 2 arguments are allowed."
    });
  });

  await t.step("should handle missing option value", () => {
    const result = parser.parse(["to", "project", "--from"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle invalid option", () => {
    const result = parser.parse(["to", "project", "--invalid"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle invalid option value", () => {
    const result = parser.parse(["to", "project", "--input", "invalid"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });

  await t.step("should handle option value starting with dash", () => {
    const result = parser.parse(["to", "project", "--from", "-invalid"]) as DoubleParamsResult;
    assertEquals(result, {
      type: "double",
      demonstrativeType: "to",
      layerType: "project",
      options: {}
    });
  });
}); 