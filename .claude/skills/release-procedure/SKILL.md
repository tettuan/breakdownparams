---
name: release-procedure
description: Use when user says 'release', 'リリース', 'publish', 'vtag', 'version up', 'バージョンアップ', or discusses merging to main/develop. Guides through version bump and release flow.
allowed-tools: [Bash, Read, Edit, Grep, Glob]
---

# Release Procedure

JSRへの確実なpublishのため、バージョンバンプからvtag作成まで段階リリースする。

バージョン管理: `deno.json` の `"version"` フィールドのみ。Patch(x.y.Z)=バグ修正, Minor(x.Y.0)=新機能, Major(X.0.0)=破壊的変更。

## バージョン検証（全マージ前に必須）

release→develop、develop→main のPR作成前に以下を検証し、未達ならマージを中止してユーザーに報告する。

```bash
# deno.jsonのバージョンがJSR最新より大きいことを確認
LOCAL=$(deno eval "const c=JSON.parse(await Deno.readTextFile('deno.json'));console.log(c.version);")
JSR=$(curl -s https://jsr.io/@tettuan/breakdownparams/versions | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | sort -V | tail -1)
echo "local=$LOCAL jsr=$JSR"
# LOCALがJSRより大きくなければバージョンバンプ未実施
```

## リリースフロー

1. release/vX.Y.Z で `scripts/bump_version.sh --patch` → deno.json更新
2. `deno task ci:dirty` でローカルCI通過確認
3. `git add deno.json && git commit -m "chore: bump version to X.Y.Z"` → push
4. **バージョン検証** → release→develop PR作成 (`gh pr create --base develop`)
5. CI通過後マージ (`gh pr merge --merge`)
6. **バージョン検証** → develop→main PR作成 (`gh pr create --base main`)
7. CI通過後マージ → JSR publish自動実行
8. vtag作成: `git tag vX.Y.Z origin/main && git push origin vX.Y.Z`
9. ブランチ削除: `git branch -D release/vX.Y.Z && git push origin --delete release/vX.Y.Z`

## 制約

各マージステップはユーザーの明示的指示が必要。連続マージ・自発的mainマージ・曖昧な指示での実行は禁止。バージョン未更新のままPR作成・マージを実行してはならない。
