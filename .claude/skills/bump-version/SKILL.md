---
name: bump-version
description: Bump the project version for release. Use when user says 'version', 'バージョン', or preparing a release.
argument-hint: "[--major|--minor|--patch] [--status] [--step]"
disable-model-invocation: true
allowed-tools: [Bash, Read]
---

バージョン更新からvtag作成までをPRワークフロー経由で自動実行するスクリプト。

```bash
scripts/bump_version.sh $ARGUMENTS
```

デフォルト: `--patch`。`--status`で進捗確認、`--step`で1ステップのみ実行。

フロー: A-1(deno.json更新) → A-2(ローカルCI→commit&push) → A-3(PR→develop) → B-1(CI待ち→マージ) → B-2(PR→main) → C-1(CI待ち→マージ) → C-2(vtag作成)

明示的に指示された場合のみ実行する。
