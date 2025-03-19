import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ParamsParser } from "../src/params_parser.ts";

/**
 * ParamsParserのテストスイート
 * 
 * 目的: コマンドライン引数の解析とバリデーション機能を検証
 * 背景: 
 * - CLIツールの引数解析は、ユーザー入力の最初の窓口として重要
 * - 誤った入力に対する適切なエラーハンドリングが必要
 * - エイリアスやオプションの組み合わせなど、複雑な入力パターンに対応する必要がある
 * 
 * テストの構成:
 * 1. パラメータなしのケース（help/versionフラグ）
 * 2. 単一パラメータのケース（initコマンド）
 * 3. 2パラメータのケース（demonstrativeTypeとlayerType）
 * 4. オプションの処理
 * 5. エラーケースの処理
 * 
 * テストの成功定義:
 * - 仕様書（docs/index.ja.md）に記載された全ての要件を満たすこと
 * - 設計書（docs/development.ja.md）に記載された設計原則に従うこと
 * - エラーケースで適切なメッセージを返すこと
 * - エイリアスと大文字小文字の扱いが仕様通りであること
 */

const parser = new ParamsParser();

/**
 * 目的: ヘルプフラグのみが指定された場合の動作を確認
 * 背景: 
 * - CLIツールでは、ユーザーがヘルプを表示したい場合にパラメータなしでヘルプフラグを使用する
 * - ヘルプフラグは他のオプションと組み合わせ可能
 * 期待される成果: 
 * - パラメータタイプが"no-params"であること
 * - helpフラグがtrueであること
 * - versionフラグがfalseであること
 * - エラーが発生しないこと
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
 * 背景: 
 * - CLIツールでは、ユーザーがバージョン情報を表示したい場合にパラメータなしでバージョンフラグを使用する
 * - バージョンフラグは他のオプションと組み合わせ可能
 * 期待される成果:
 * - パラメータタイプが"no-params"であること
 * - helpフラグがfalseであること
 * - versionフラグがtrueであること
 * - エラーが発生しないこと
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
 * 背景: 
 * - CLIツールでは、複数のフラグを組み合わせて使用できる必要がある
 * - フラグの組み合わせは順序に依存しない
 * 期待される成果:
 * - パラメータタイプが"no-params"であること
 * - helpフラグがtrueであること
 * - versionフラグがtrueであること
 * - エラーが発生しないこと
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
 * 背景: 
 * - CLIツールでは、初期化などの特殊なコマンドを単一パラメータとして受け付ける必要がある
 * - initコマンドは他のオプションと組み合わせ可能
 * 期待される成果:
 * - パラメータタイプが"single"であること
 * - commandが"init"であること
 * - エラーが発生しないこと
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
 * 背景: 
 * - ユーザーが誤ったコマンドを入力した場合、適切なエラーメッセージを返す必要がある
 * - エラーメッセージは具体的で、ユーザーが正しいコマンドを特定できる必要がある
 * 期待される成果:
 * - パラメータタイプが"single"であること
 * - エラーメッセージが適切に設定されていること
 * - エラーメッセージに許可されるコマンドが含まれていること
 */
Deno.test("Single parameter with invalid command", () => {
  const result = parser.parse(["invalid"]);
  assertEquals(result.type, "single");
  if (result.type === "single") {
    assertExists(result.error);
    assertEquals(result.error, 'Invalid command: invalid. Only "init" is allowed.');
  }
});

/**
 * 目的: 有効な2つのパラメータが正しく解析されることを確認
 * 背景: 
 * - CLIツールの主要な機能は2つのパラメータ（demonstrativeTypeとlayerType）を使用する
 * - パラメータの組み合わせは厳密に定義されている
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeが"to"であること
 * - layerTypeが"issue"であること
 * - オプションが空であること
 * - エラーが発生しないこと
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
 * 背景: 
 * - ユーザーの利便性のために、レイヤータイプには複数のエイリアスが存在する
 * - エイリアスは小文字のみ有効
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeが"summary"であること
 * - layerTypeが"issue"であること（"story"から正しく解決されること）
 * - エラーが発生しないこと
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
 * 背景: 
 * - ユーザーが誤ったdemonstrativeTypeを入力した場合、適切なエラーメッセージを返す必要がある
 * - エラーメッセージは許可される値の一覧を含む必要がある
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - エラーメッセージが適切に設定されていること
 * - エラーメッセージに許可される値の一覧が含まれていること
 */
Deno.test("Double parameters with invalid demonstrative type", () => {
  const result = parser.parse(["invalid", "issue"]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertExists(result.error);
    assertEquals(result.error, "Invalid demonstrative type: invalid. Must be one of: to, summary, defect");
  }
});

/**
 * 目的: 無効なlayerTypeが指定された場合のエラーハンドリングを確認
 * 背景: 
 * - ユーザーが誤ったlayerTypeを入力した場合、適切なエラーメッセージを返す必要がある
 * - エイリアスが存在しない値は無効として扱う
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - エラーメッセージが適切に設定されていること
 * - エラーメッセージに無効な値が含まれていること
 */
Deno.test("Double parameters with invalid layer type", () => {
  const result = parser.parse(["to", "invalid"]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertExists(result.error);
    assertEquals(result.error, "Invalid layer type: invalid");
  }
});

/**
 * 目的: 長い形式のオプションが正しく解析されることを確認
 * 背景: 
 * - CLIツールでは、オプションの長い形式（--from, --destination, --input）をサポートする必要がある
 * - 長い形式は短い形式より優先される
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeとlayerTypeが正しく設定されていること
 * - すべてのオプションが正しく解析されていること
 * - エラーが発生しないこと
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
 * 背景: 
 * - CLIツールでは、オプションの短い形式（-f, -o, -i）をサポートする必要がある
 * - 短い形式は長い形式が未指定の場合のみ有効
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeとlayerTypeが正しく設定されていること
 * - すべての短い形式のオプションが正しく解析されていること
 * - エラーが発生しないこと
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
 * 背景: 
 * - CLIツールでは、仕様で定められた最大パラメータ数（2つ）を超える入力を適切に処理する必要がある
 * - エラーメッセージは具体的で、制限を明確に示す必要がある
 * 期待される成果:
 * - パラメータタイプが"no-params"であること
 * - エラーメッセージが適切に設定されていること
 * - エラーメッセージに最大パラメータ数が含まれていること
 */
Deno.test("Too many parameters", () => {
  const result = parser.parse(["to", "issue", "extra"]);
  assertEquals(result.type, "no-params");
  assertExists(result.error);
  assertEquals(result.error, "Too many arguments. Maximum 2 arguments are allowed.");
});

/**
 * 目的: オプションの複合的な組み合わせを確認
 * 背景: 
 * - CLIツールでは、複数のオプションを組み合わせて使用するケースがある
 * - オプションの組み合わせは順序に依存しない
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeとlayerTypeが正しく設定されていること
 * - すべてのオプションが正しく解析されていること
 * - エラーが発生しないこと
 */
Deno.test("Double parameters with multiple options", () => {
  const result = parser.parse([
    "to",
    "issue",
    "--from",
    "input.md",
    "--destination",
    "output.md",
    "--input",
    "project",
    "-f",
    "another.md",
    "-o",
    "another.md",
    "-i",
    "task"
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
 * 目的: レイヤータイプの大文字小文字の扱いを確認
 * 背景: 
 * - 仕様では小文字のみが有効とされている
 * - 大文字を含むエイリアスは無効として扱う
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - 大文字のエイリアスは無効として扱われ、エラーメッセージが返されること
 * - エラーメッセージに無効な値が含まれていること
 */
Deno.test("Double parameters with uppercase layer type", () => {
  const result = parser.parse(["to", "STORY"]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertExists(result.error);
    assertEquals(result.error, "Invalid layer type: STORY");
  }
});

/**
 * 目的: オプションの値が不正な場合のエラーハンドリングを確認
 * 背景: 
 * - オプションの値が不正な場合でも、パースは継続される必要がある
 * - 不正な値は無視され、デフォルト値が使用される
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - demonstrativeTypeとlayerTypeが正しく設定されていること
 * - 不正なオプション値は無視されること
 * - エラーが発生しないこと
 */
Deno.test("Double parameters with invalid option values", () => {
  const result = parser.parse([
    "to",
    "issue",
    "--from",
    "--invalid",
    "--destination",
    "--invalid",
    "--input",
    "invalid"
  ]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "to");
    assertEquals(result.layerType, "issue");
    assertEquals(result.options, {});
  }
});

/**
 * 目的: オプションの重複指定時の挙動を確認
 * 背景: 
 * - 仕様ではロングフォームが優先される
 * - 同じオプションが複数回指定された場合、最後の指定が有効
 * 期待される成果:
 * - パラメータタイプが"double"であること
 * - ロングフォームの値が優先されること
 * - ショートハンドの値は無視されること
 * - エラーが発生しないこと
 */
Deno.test("Double parameters with duplicate options", () => {
  const result = parser.parse([
    "to",
    "issue",
    "--from",
    "long.md",
    "-f",
    "short.md",
    "--destination",
    "long.md",
    "-o",
    "short.md",
    "--input",
    "project",
    "-i",
    "task"
  ]);
  assertEquals(result.type, "double");
  if (result.type === "double") {
    assertEquals(result.demonstrativeType, "to");
    assertEquals(result.layerType, "issue");
    assertEquals(result.options, {
      fromFile: "long.md",
      destinationFile: "long.md",
      fromLayerType: "project"
    });
  }
}); 