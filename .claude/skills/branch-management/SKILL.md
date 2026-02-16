---
name: branch-management
description: Review and guide branch strategy when creating PRs, merging, or creating branches involving main, develop, and release branches
allowed-tools: [Bash, Read, Grep, Glob]
---

# Branch Management

品質を段階検証するため、`Work → release/vX.Y.Z → develop → main → vtag` の一方向でマージする。リリースフローは `/release-procedure` を参照。

| 操作 | 許可 | 禁止 |
|------|------|------|
| main変更 | developからのPRのみ | 直接push、他ブランチからマージ |
| develop変更 | release/*からのPRのみ | 直接push |
| release/*作成 | developから分岐 | main・作業ブランチから分岐 |
| 作業ブランチ作成 | release/*から分岐 | main・developから直接分岐 |

命名: `feature/*` `fix/*` `refactor/*` `docs/*` `release/vX.Y.Z`

マージ方式: work→release=squash, release→develop=merge, develop→main=merge

## バージョンゲート

release/*ブランチ作成時に `deno.json` のバージョンがJSR最新より大きいことを確認する。未更新なら `/release-procedure` のステップ1（bump_version.sh）を先に実行する。develop→main PR作成時も同様に検証し、バージョン未更新のままマージを進めない。

警告: `git push origin main`/`git push origin develop` は直接push禁止。作業ブランチは `release/*` から分岐すること。
