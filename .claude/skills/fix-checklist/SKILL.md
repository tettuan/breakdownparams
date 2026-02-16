---
name: fix-checklist
description: Use when about to fix code, modify implementation, or address errors. MUST read before saying "fix", "修正します", "直す", "対処する". Prevents symptom-driven fixes.
allowed-tools: [Read, Glob, Grep]
---

# Fix Checklist

症状駆動の修正は設計を壊すので、コード変更前に根本原因を特定する。

## 手順

1. **止まる** — コードを書かない、ファイルを編集しない
2. **Why** — エラーは症状。「なぜ発生？システムは何を期待？」を問う
3. **設計を読む** — `docs/`の関連設計書を読み、意図された動作を理解する
4. **フローを追う** — 何がトリガー→期待状態→どこで乖離？
5. **根本原因を特定** — エラー箇所≠原因箇所（型定義`src/types/`、バリデーション`src/validation/`、リプレーサ`src/replacers/`、コア`src/core/`）
6. **理解を検証** — 根本原因・設計意図・最小限の正しい修正を言語化する
7. **修正** — 根本原因に対する最小変更のみ実行

アンチパターン: 「Xが見つからない→Xを追加」ではなく「なぜXが期待されるのか→設計はXについて何を言っているか」

複雑な問題は `tmp/investigation/<issue>/` に overview.md, trace.md, root-cause.md を書く。
