---
name: docs-consistency
description: Verify and fix documentation to match implementation. Use when updating docs, releasing versions, or when user mentions 'docs consistency', 'docs verify', 'ドキュメント更新', 'docsを直して'.
allowed-tools: [Read, Edit, Grep, Glob, Bash]
---

# Docs Consistency

ドキュメントは実装を説明するものであり設計を書き換えないため、設計意図→実装調査→差分検出→docs修正の順で更新する。

1. **設計意図抽出** — `docs/`の設計書からWhat/Why/制約を読む
2. **実装調査** — `mod.ts`(公開API), `src/types/`(型), `src/core/`(コア), `src/validation/`, `src/replacers/`を確認
3. **差分検出** — 設計+実装 vs 現ドキュメントの差分表を作成（Gap列が空でなければ修正対象）
4. **docs修正** — 設計docsは変更せず、README.md → docs/user_guide.md → docs/api_reference.md の優先順で更新
5. **検証** — `grep "^export" mod.ts` で公開APIとdocsの一致確認

言語: `*.md`=英語, `*.ja.md`=日本語
