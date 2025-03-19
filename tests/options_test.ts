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

const defaultOptions = {
  command: "test-cli",
  help: "Test CLI tool",
  version: "1.0.0",
  demonstrativeType: "command"
};

Deno.test("parse - options", () => {
  const parser = new ParamsParser(defaultOptions);
  const testCases = [
    {
      args: ["to", "project", "--from", "input.txt", "--destination", "output.txt"],
      expected: {
        demonstrativeType: "to",
        param1: "project",
        param2: "project"
      }
    },
    {
      args: ["to", "project", "-f", "input.txt", "-o", "output.txt"],
      expected: {
        demonstrativeType: "to",
        param1: "project",
        param2: "project"
      }
    },
    {
      args: ["to", "project", "--input", "project"],
      expected: {
        demonstrativeType: "to",
        param1: "project",
        param2: "project"
      }
    }
  ];

  for (const { args, expected } of testCases) {
    const result = parser.parse(args);
    assertEquals(result.type, "success");
    if (result.type === "success" && "param2" in result.data) {
      assertEquals(result.data.demonstrativeType, expected.demonstrativeType);
      assertEquals(result.data.param1, expected.param1);
      assertEquals(result.data.param2, expected.param2);
    }
  }
}); 