---
name: refactoring
description: Use when refactoring code, reorganizing modules, renaming types, deleting old paths, or migrating architecture. MUST read before any structural code change. Prevents incomplete refactoring.
allowed-tools: [Read, Glob, Grep, Edit, Write, Bash, Task]
---

# Refactoring

新パスが旧パスの全契約を継承すると証明できるまで、旧パスを削除してはならない。

## Phase 1: 棚卸し

削除・変更対象と全消費者をgrepで列挙する。移行先のない消費者がある場合、削除不可。

## Phase 2: 契約検証

Before/After表を作成し、After列が空の行があれば未完了。検証方法: 直線=コードレビュー / 分岐あり=境界テスト / 外部依存=E2E実行。

## Phase 3: 実行

1commit=1関心事（新パス追加→消費者移行→旧パス削除→docs更新）。各commitで `deno task ci` 通過必須。dead codeは同一PRで削除する。

## Phase 4: 検証

```bash
deno cache --reload mod.ts                              # キャッシュクリア
grep -r "OldName" --include="*.ts" src/ tests/ mod.ts   # 残存参照ゼロ確認
grep -r "OldName" --include="*.md" docs/ README.md      # docs残存確認
```

アンチパターン: 旧削除→新実装後回し / grep無しの「誰も使ってない」判断 / リファクタと機能追加の混在 / キャッシュクリア忘れ
