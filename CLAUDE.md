Deno + JSR publishプロジェクト。テストとfixtureは `tests/` に置く。OOP・デザインパターン・TDDを活用する。

# Language
日本語で会話し、コードは英語で書く。

# Type Safety
型安全のため、strict: trueで明示的型定義を使う。

# Readable
可読性のため、マジックナンバーはENUMに置き換え、JSDocを書く。

# Lint and Format
lint/fmtはテスト通過後に修正する（`deno fmt`, `deno lint`, 設定は `deno.json`）。

# Skills
Git → `/branch-management` | CI → `/local-ci` | テスト → `/run-tests` | エラー修正 → `/fix-checklist`
デバッグ → `/breakdownlogger-implement-logger`, `/breakdownlogger-debug-with-logger`
リリース → `/release-procedure`, `/bump-version`
レビュー → `/review` | リファクタ → `/refactoring` | ドキュメント → `/update-docs`, `/docs-consistency`, `/update-changelog`

# Specifications
仕様は `docs/index.md` と `docs/glossary.md` から読む。

# Comments
テスト通過時のみJSDocコメントを書く（purpose, expects, intent, reason）。
