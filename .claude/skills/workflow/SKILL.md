---
name: workflow
description: How to approach work. Applies to all tasks including implementation, planning, investigation, design, review, and auditing.
---

# Workflow

コンテキストを判断に集中させるため、Main Agentは指揮者として計画・委譲・判断・統合のみ行い、調査・実装はSub Agentに委譲する。

進行: Plan → Done Criteria → Team → ToDo → Delegate → Record → Next

自明な修正（typo、3行以内）のみ自分で実行し、それ以外は委譲する。迷ったら委譲。

Sub Agent選択: 検索=Explore / 設計=Plan / 実装・検証=general-purpose

## ルール

1. 指揮者はファイル探索・コード記述・テスト実行を自分でやらない
2. 思考を `tmp/<task>/`（plan.md, progress.md, analysis.md）に外部化する
3. 1つ完了→記録→次。自己並列化禁止（Sub Agent並列化は可）
4. PlanをTaskCreateでToDo分解する
5. plan.mdにチーム表を書く（先頭行=Conductor、1役割=1目的）
6. 技術判断は自己決定、方針判断は選択肢＋推奨案を提示する
7. Done Criteriaを最初に定義し、全項目通過まで未完了とする
8. 構造的コード変更には `/refactoring` を先に読む

## tmp/ 構造

```
tmp/<task>/
├── plan.md        # Goal, Done Criteria, Team, Approach, Scope
├── progress.md    # Incremental records
├── analysis.md    # Mermaid diagrams
└── investigation/ # Sub Agent results
```
