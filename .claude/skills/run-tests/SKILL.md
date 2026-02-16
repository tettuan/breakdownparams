---
name: run-tests
description: Run tests with debug logging. Use when user says 'test', 'テスト', or asks to verify changes.
argument-hint: "[test-file-path]"
allowed-tools: [Bash, Read, Grep, Glob]
---

デバッグ出力付きでテストを実行する。引数なしの場合は全テスト実行。

```bash
LOG_LEVEL=debug deno test $ARGUMENTS --allow-env --allow-write --allow-read
```

テスト階層: `tests/`下に `00_fixtures/` `01_unit/` `02_integration/` `03_system/`。ファイル命名: `*_test.ts`。
