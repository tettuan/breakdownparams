---
name: review
description: Review code changes for quality, correctness, and adherence to project conventions. Use when user says 'review', 'レビュー', or asks to check code quality.
argument-hint: "[file-or-path]"
allowed-tools: [Read, Grep, Glob, Bash]
---

# Code Review

`$ARGUMENTS`指定時はそのファイル、未指定時は`git diff`の変更をレビューする。

| 観点 | 基準 |
|------|------|
| 型安全 | strict準拠、`any`禁止、`PromptResult`/`PromptParams`/`Variables`型を使用 |
| 命名 | テンプレート変数=`{snake_case}`、TS=camelCase/PascalCase、テストファイル=`*_test.ts` |
| エラー処理 | `ValidationError`/`TemplateError`/`FileSystemError`使用、`PromptResult.success`で伝播 |
| パス検証 | `src/validation/path_validator.ts`経由、実装に絶対パス禁止（`/absolute-path-checker`） |
| テスト | `tests/`に対応テスト存在（`01_unit/`→`02_integration/`→`03_system/`） |
| import | deno.jsonのimport mapエイリアス必須（`jsr:`/`npm:`/`https://`インライン禁止） |
| フォーマット | 2スペースインデント、100文字幅、ダブルクォート、セミコロン |

ファイルパスと行番号付きで指摘する。
