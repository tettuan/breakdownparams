---
name: release-branch-init
description: Use when starting a new release. Creates release/vX.Y.Z from develop, bumps version, runs local CI, commits and pushes. Triggers: 'リリース開始', 'release branch', 'バージョン上げて', 'minor ver のブランチ', 'patch ver のブランチ'.
argument-hint: "[--major|--minor|--patch]"
allowed-tools: [Bash, Read, Edit]
---

# Release Branch Init

issue 作業前にリリースブランチを準備するため、develop から release/vX.Y.Z 作成 + version bump + ローカル CI + commit + push を一括実行する。**PR は作成しない**（issue 作業完了後に `/release-procedure` で実施）。

引数: `--major | --minor | --patch`（デフォルト patch）

## 手順

### 1. 前提検査

```bash
# develop へ移動・同期
git checkout develop
git pull origin develop

# 作業ツリー clean 確認（dirty なら中止しユーザー報告）
git status --porcelain
```

dirty なら中止。コミット未消化を解消してから再実行。

### 2. バージョン算出

```bash
# JSR 最新取得
JSR=$(curl -s https://jsr.io/@tettuan/breakdownparams/versions | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | sort -V | tail -1)

# bump 種別から新 version 算出（major/minor/patch）
IFS='.' read -r MA MI PA <<< "$JSR"
case "$BUMP" in
  major) NEW="$((MA+1)).0.0" ;;
  minor) NEW="$MA.$((MI+1)).0" ;;
  patch) NEW="$MA.$MI.$((PA+1))" ;;
esac

# deno.json 現 version と比較。NEW が後退なら中止
LOCAL=$(deno eval "const c=JSON.parse(await Deno.readTextFile('deno.json'));console.log(c.version);")
echo "jsr=$JSR local=$LOCAL new=$NEW"
```

### 3. ブランチ作成

```bash
git checkout -b "release/v$NEW"
```

### 4. deno.json 更新

```bash
deno eval "const c=JSON.parse(await Deno.readTextFile('deno.json')); c.version='$NEW'; await Deno.writeTextFile('deno.json', JSON.stringify(c, null, 2).trimEnd() + '\n');"
```

### 5. ローカル CI

```bash
deno task ci:dirty
```

失敗で中止。エラーをユーザー報告。

### 6. commit + push

```bash
git add deno.json
git commit -m "chore: bump version to $NEW"
git push -u origin "release/v$NEW"
```

### 7. 完了報告

新 version、ブランチ名、JSR 比較結果を報告。次の手順として「issue 作業完了後 `/release-procedure` で PR 作成・マージ・tag」を案内。

## 制約

- develop 以外から起動禁止（branch-management 準拠）
- dirty ツリーで起動禁止
- バージョン後退禁止（NEW > LOCAL かつ NEW > JSR）
- PR 作成しない（issue 作業中の commit 蓄積を妨げないため）
- ローカル CI 失敗で中止（push 前に品質保証）
