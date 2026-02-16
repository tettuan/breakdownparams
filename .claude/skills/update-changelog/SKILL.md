---
name: update-changelog
description: Use when completing features, fixes, or changes that should be recorded. Updates CHANGELOG.md with concise, searchable entries following Keep a Changelog format.
allowed-tools: [Read, Edit, Grep, Glob]
---

# CHANGELOG Update

変更履歴を検索可能に保つため、Keep a Changelog形式でCHANGELOG.mdを更新する。

セクション: Added(新機能) / Changed(動作変更) / Deprecated(非推奨) / Removed(削除) / Fixed(バグ修正) / Security(脆弱性修正)

1行1変更、ユーザー影響を書く（実装詳細ではなく）。識別子（変数名・型名・設定名）を含める。`[Unreleased]`に追加し、リリース時に `[x.y.z] - YYYY-MM-DD` へ移動。

良い例: `Fixed: {destination_path} replacement failing when path contains spaces`
悪い例: `Fixed: the bug` / `Changed: Refactored VariableReplacer to use async/await`
