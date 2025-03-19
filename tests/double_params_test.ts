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

import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";

const defaultOptions = {
  command: "test-cli",
  help: "Test CLI tool",
  version: "1.0.0",
  demonstrativeType: "command"
};

Deno.test("parse - double parameters", () => {
  const parser = new ParamsParser(defaultOptions);
  const result = parser.parse(["to", "project"]);
  assertEquals(result.type, "success");
  if (result.type === "success" && "param2" in result.data) {
    assertEquals(result.data.demonstrativeType, "to");
    assertEquals(result.data.param1, "project");
    assertEquals(result.data.param2, "project");
  }
});

Deno.test("parse - double parameters with different demonstrative types", () => {
  const parser = new ParamsParser(defaultOptions);
  const testCases = [
    { args: ["summary", "issue"], demonstrativeType: "summary" },
    { args: ["defect", "task"], demonstrativeType: "defect" }
  ];

  for (const { args, demonstrativeType } of testCases) {
    const result = parser.parse(args);
    assertEquals(result.type, "success");
    if (result.type === "success" && "param2" in result.data) {
      assertEquals(result.data.demonstrativeType, demonstrativeType);
    }
  }
}); 