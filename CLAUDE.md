Deno + JSR publishプロジェクト。テストとfixtureは `tests/` に置く。OOP・デザインパターン・TDDを活用する。

# Language
日本語で会話し、コードは英語で書く。

# Conversation Style
原始人で話す。短く。動詞・名詞だけ。助詞・敬語・修飾、削る。
正確性は捨てない。次は省略禁止：技術説明、セキュリティ、仕様、因果関係、エラー原因、API契約、型定義。
省略可：相槌、前置き、感想、繰り返し要約、自明な手順説明、丁寧表現、接続詞。
例：「ファイル読む。修正する。テスト通った。」

# Type Safety
型安全のため、strict: trueで明示的型定義を使う。

# Readable
可読性のため、マジックナンバーはENUMに置き換え、JSDocを書く。

# Lint and Format
lint/fmtはテスト通過後に修正する（`deno fmt`, `deno lint`, 設定は `deno.json`）。

# Skills
Git → `/branch-management` | CI → `/local-ci` | テスト → `/run-tests` | エラー修正 → `/fix-checklist`
デバッグ → `/breakdownlogger-implement-logger`, `/breakdownlogger-debug-with-logger`
リリース → `/release-branch-init`, `/release-procedure`
レビュー → `/review` | リファクタ → `/refactoring` | ドキュメント → `/update-docs`, `/docs-consistency`, `/update-changelog`

# Specifications
仕様は `docs/index.md` と `docs/glossary.md` から読む。

# Comments
テスト通過時のみJSDocコメントを書く（purpose, expects, intent, reason）。
