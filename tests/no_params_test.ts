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

const defaultOptions = {
  command: "test-cli",
  help: "Test CLI tool",
  version: "1.0.0",
  demonstrativeType: "command"
};

Deno.test("parse - no parameters", () => {
  const parser = new ParamsParser(defaultOptions);
  const testCases = [
    {
      args: [],
      expected: {
        help: false,
        version: false
      }
    },
    {
      args: ["--help"],
      expected: {
        help: true,
        version: false
      }
    },
    {
      args: ["-h"],
      expected: {
        help: true,
        version: false
      }
    },
    {
      args: ["--version"],
      expected: {
        help: false,
        version: true
      }
    },
    {
      args: ["-v"],
      expected: {
        help: false,
        version: true
      }
    },
    {
      args: ["-h", "--version"],
      expected: {
        help: true,
        version: true
      }
    }
  ];

  for (const { args, expected } of testCases) {
    const result = parser.parse(args);
    assertEquals(result.type, "success");
    if (result.type === "success") {
      assertEquals(result.data.help, expected.help);
      assertEquals(result.data.version, expected.version);
    }
  }
}); 