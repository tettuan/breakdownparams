import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";
import type {
  NoParamsResult,
  SingleParamResult,
  DoubleParamsResult,
  DemonstrativeType,
  LayerType,
} from "../src/types.ts";

/**
 * ParamsParserのテストスイート
 * 仕様書に基づいて、以下のケースをテスト
 * 1. パラメータなしのケース
 * 2. オプションのみのケース
 * 3. 単一パラメータのケース
 * 4. 2パラメータのケース
 * 5. エラーケース
 */

const defaultOptions = {
  command: "test-cli",
  help: "Test CLI tool",
  version: "1.0.0",
  demonstrativeType: "command"
};

const parser = new ParamsParser();

/**
 * 目的: ヘルプフラグのみが指定された場合の動作を確認
 * 背景: CLIツールでは、ユーザーがヘルプを表示したい場合にパラメータなしでヘルプフラグを使用する
 * 期待される成果: 
 * - パラメータタイプが"no-params"であること
 * - helpフラグがtrueであること
 * - versionフラグがfalseであること
 */
Deno.test("No parameters with help flag", () => {
  const result = parser.parse(["-h"]);
  assertEquals(result.type, "no-params");
  if (result.type === "no-params") {
    assertEquals(result.help, true);
    assertEquals(result.version, false);
  }
});

/**
 * 目的: バージョンフラグのみが指定された場合の動作を確認
 * 背景: CLIツールでは、ユーザーがバージョン情報を表示したい場合にパラメータなしでバージョンフラグを使用する
 * 期待される成果:
 * - パラメータタイプが"no-params"であること
 * - helpフラグがfalseであること
 * - versionフラグがtrueであること
 */
Deno.test("No parameters with version flag", () => {
  const result = parser.parse(["-v"]);
  assertEquals(result.type, "no-params");
  if (result.type === "no-params") {
    assertEquals(result.help, false);
    assertEquals(result.version, true);
  }
});

/**
 * 目的: ヘルプとバージョンフラグが同時に指定された場合の動作を確認
 * 背景: CLIツールでは、複数のフラグを組み合わせて使用できる必要がある
 * 期待される成果:
 * - パラメータタイプが"no-params"であること
 * - helpフラグがtrueであること
 * - versionフラグがtrueであること
 */
Deno.test("No parameters with both help and version flags", () => {
  const result = parser.parse(["-h", "-v"]);
  assertEquals(result.type, "no-params");
  if (result.type === "no-params") {
    assertEquals(result.help, true);
    assertEquals(result.version, true);
  }
});

/**
 * 目的: initコマンドが正しく解析されることを確認
 * 背景: CLIツールでは、初期化などの特殊なコマンドを単一パラメータとして受け付ける必要がある
 * 期待される成果:
 * - パラメータタイプが"single"であること
 * - commandが"init"であること
 */
Deno.test("Single parameter with init command", () => {
  const result = parser.parse(["init"]);
  assertEquals(result.type, "single");
  if (result.type === "single") {
    assertEquals(result.command, "init");
  }
});

/**
 * 目的: 無効なコマンドが指定された場合のエラーハンドリングを確認
 * 背景: ユーザーが誤ったコマンドを入力した場合、適切なエラーメッセージを返す必要がある
 * 期待される成果:
 * - パラメータタイプが"single"であること
 * - commandが"init"であること（デフォルト値）
 * - エラーメッセージが適切に設定されていること
 */
Deno.test("Single parameter with invalid command", () => {
  const result = parser.parse(["invalid"]);
  assertEquals(result.type, "single");
  if (result.type === "single") {
    assertEquals(result.command, "init");
    assertExists(result.error);
    assertEquals(result.error, 'Invalid command: invalid. Only "init" is allowed.');
  }
});

/**
 * 目的: 有効な2つのパラメータが正しく解析されることを確認
 * 背景: CLIツールの主要な機能は2つのパラメータ（demonstrativeTypeとlayerType）を使用する
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeが"to"であること
 * - layerTypeが"issue"であること
 * - オプションが空であること
 */
Deno.test("Double parameters with valid values", () => {
  const result = parser.parse(["to", "issue"]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "to");
    assertEquals(result.layerType, "issue");
    assertEquals(result.options, {});
  }
});

/**
 * 目的: レイヤータイプのエイリアスが正しく解決されることを確認
 * 背景: ユーザーの利便性のために、レイヤータイプには複数のエイリアスが存在する
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeが"summary"であること
 * - layerTypeが"issue"であること（"story"から正しく解決されること）
 */
Deno.test("Double parameters with layer type alias", () => {
  const result = parser.parse(["summary", "story"]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "summary");
    assertEquals(result.layerType, "issue");
    assertEquals(result.options, {});
  }
});

/**
 * 目的: 無効なdemonstrativeTypeが指定された場合のエラーハンドリングを確認
 * 背景: ユーザーが誤ったdemonstrativeTypeを入力した場合、適切なエラーメッセージを返す必要がある
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeが"to"であること（デフォルト値）
 * - layerTypeが"project"であること（デフォルト値）
 * - エラーメッセージが適切に設定されていること
 */
Deno.test("Double parameters with invalid demonstrative type", () => {
  const result = parser.parse(["invalid", "issue"]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "to");
    assertEquals(result.layerType, "project");
    assertExists(result.error);
    assertEquals(result.error, "Invalid demonstrative type: invalid. Must be one of: to, summary, defect");
  }
});

/**
 * 目的: 無効なlayerTypeが指定された場合のエラーハンドリングを確認
 * 背景: ユーザーが誤ったlayerTypeを入力した場合、適切なエラーメッセージを返す必要がある
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeが"to"であること
 * - layerTypeが"project"であること（デフォルト値）
 * - エラーメッセージが適切に設定されていること
 */
Deno.test("Double parameters with invalid layer type", () => {
  const result = parser.parse(["to", "invalid"]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "to");
    assertEquals(result.layerType, "project");
    assertExists(result.error);
    assertEquals(result.error, "Invalid layer type: invalid");
  }
});

/**
 * 目的: 長い形式のオプションが正しく解析されることを確認
 * 背景: CLIツールでは、オプションの長い形式（--from, --destination, --input）をサポートする必要がある
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeとlayerTypeが正しく設定されていること
 * - すべてのオプションが正しく解析されていること
 */
Deno.test("Double parameters with options", () => {
  const result = parser.parse([
    "to",
    "issue",
    "--from",
    "input.md",
    "--destination",
    "output.md",
    "--input",
    "project"
  ]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "to");
    assertEquals(result.layerType, "issue");
    assertEquals(result.options, {
      fromFile: "input.md",
      destinationFile: "output.md",
      fromLayerType: "project"
    });
  }
});

/**
 * 目的: 短い形式のオプションが正しく解析されることを確認
 * 背景: CLIツールでは、オプションの短い形式（-f, -o, -i）をサポートする必要がある
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeとlayerTypeが正しく設定されていること
 * - すべての短い形式のオプションが正しく解析されていること
 */
Deno.test("Double parameters with short form options", () => {
  const result = parser.parse([
    "to",
    "issue",
    "-f",
    "input.md",
    "-o",
    "output.md",
    "-i",
    "project"
  ]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "to");
    assertEquals(result.layerType, "issue");
    assertEquals(result.options, {
      fromFile: "input.md",
      destinationFile: "output.md",
      fromLayerType: "project"
    });
  }
});

/**
 * 目的: パラメータが多すぎる場合のエラーハンドリングを確認
 * 背景: CLIツールでは、仕様で定められた最大パラメータ数（2つ）を超える入力を適切に処理する必要がある
 * 期待される成果:
 * - パラメータタイプが"no-params"であること
 * - helpフラグとversionフラグがfalseであること
 * - エラーメッセージが適切に設定されていること
 */
Deno.test("Too many parameters", () => {
  const result = parser.parse(["to", "issue", "extra"]);
  assertEquals(result.type, "no-params");
  if (result.type === "no-params") {
    assertEquals(result.help, false);
    assertEquals(result.version, false);
    assertExists(result.error);
    assertEquals(result.error, "Too many arguments. Maximum 2 arguments are allowed.");
  }
}); 