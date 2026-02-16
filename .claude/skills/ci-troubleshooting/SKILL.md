---
name: ci-troubleshooting
description: Use when encountering CI errors, JSR connection issues, 'deno task ci' failures, or sandbox-related build problems. Provides solutions for common CI issues.
allowed-tools: [Bash, Read, Edit, Grep, Glob]
---

# CI Troubleshooting

## JSR接続エラー

`JSR package manifest failed to load` → sandbox無効で実行: `Bash({ command: "deno task ci", dangerouslyDisableSandbox: true })`

## Lintルール対処

| ルール | 修正 |
|--------|------|
| `no-import-prefix` | deno.jsonのimport mapエイリアスを使う（`jsr:`/`npm:`/`https:`インライン禁止） |
| `no-console` | `// deno-lint-ignore no-console` 追加 |
| `prefer-ascii` | コメントを英語に変更 |
| `no-await-in-loop` | ignore追加またはPromise.allにリファクタ |
| `eqeqeq` | `!==`/`===` を使う |
| `explicit-function-return-type` | 戻り値型を追加 |
| `ban-unused-ignore` | 不要なignoreを削除 |

新依存追加時は `deno.json` の `imports` にエントリを追加してから使用する。ファイル単位: `// deno-lint-ignore-file rule1 rule2`、行単位: `// deno-lint-ignore rule`

## テスト失敗

タイミング問題: 並列実行を順次に変更し適切な遅延を入れる。型エラー: 型アサーション・mock実装・fixture整合性を確認。

## クイックデバッグ

```bash
deno check mod.ts                    # 型チェックのみ
deno lint                            # リントのみ
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read tests/<file>_test.ts  # 単一テスト
```
