---
name: update-docs
description: Use when implementing new features, changing behavior, or modifying the public API. Documents changes in README and relevant docs.
allowed-tools: [Read, Edit, Grep, Glob, Bash]
---

# Documentation Update

ユーザー向け変更を適切な場所に文書化するため、変更種別に応じたドキュメントを更新する。

| 変更種別 | 更新先 |
|----------|--------|
| 新公開API | README.md（概要）+ docs/api_reference.md（詳細）+ mod.ts（export/JSDoc） |
| 新機能 | README.md + docs/user_guide.md（複雑な場合） |
| 動作変更 | README.md（既存記述更新）+ CHANGELOG.md |
| 変数システム変更 | README.md + docs/variables.ja.md / docs/type_of_variables.ja.md |
| 内部変更 | CLAUDE.md（開発ワークフローに影響する場合のみ） |

手順: `git diff --name-only`で変更特定→種別分類→対象ドキュメント更新→コード例の動作確認

原則: 簡潔に、例を先に、検索可能なキーワードを含める。内部実装詳細・一時的回避策・デバッグ専用オプションは文書化しない。
