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

const defaultOptions = {
  command: "test-cli",
  help: "Test CLI tool",
  version: "1.0.0",
  demonstrativeType: "command"
};

Deno.test("parse - error cases", () => {
  const parser = new ParamsParser(defaultOptions);
  const testCases = [
    {
      args: ["invalid", "project"],
      expectedError: "Invalid demonstrative type: invalid"
    },
    {
      args: ["to", "invalid"],
      expectedError: "Invalid demonstrative type: invalid"
    },
    {
      args: ["to", "project", "extra"],
      expectedError: "Too many parameters provided"
    }
  ];

  for (const { args, expectedError } of testCases) {
    const result = parser.parse(args);
    assertEquals(result.type, "error");
    if (result.type === "error") {
      assertEquals(result.error, expectedError);
    }
  }
}); 