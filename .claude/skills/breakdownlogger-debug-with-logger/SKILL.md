---
name: debug-with-logger
description: Use when debugging test failures, investigating behavior, or running tests with BreakdownLogger output. Guides the 3-phase debugging workflow and environment controls. Trigger words - 'debug', 'デバッグ', 'test failure', 'テスト失敗', 'investigate', '調査', 'LOG_LEVEL', 'LOG_KEY'.
allowed-tools: Read, Grep, Glob, Bash
---

# Debug with Logger

3つの直交する制御次元（level×length×key）を段階的に絞り込むことで、根本原因を効率的に特定する。

## 制御次元

| 変数 | 問い | 値 |
|------|------|------|
| `LOG_LEVEL` | 深刻度 | `debug`/`info`/`warn`/`error` |
| `LOG_LENGTH` | 詳細度 | 未設定/`S`/`L`/`W` |
| `LOG_KEY` | コンポーネント | カンマ区切り（完全一致） |

## 3フェーズ

```bash
# Phase 1: エラーのみで障害箇所を特定
LOG_LEVEL=error deno test --allow-env --allow-read --allow-write
# Phase 2: KEYで絞り込み
LOG_LEVEL=debug LOG_KEY=<key> LOG_LENGTH=S deno test --allow-env --allow-read --allow-write
# Phase 3: 特定箇所の全量確認
LOG_LEVEL=debug LOG_KEY=<key> LOG_LENGTH=W deno test --allow-env --allow-read --allow-write tests/<file>_test.ts
```

## KEY検索

```bash
grep -rn 'new BreakdownLogger(' --include='*.ts' | grep -oP '"[^"]*"' | sort -u
```

## トラブルシュート

出力なし→`LOG_LEVEL`確認 / 出力過多→`LOG_KEY`追加 / 切り詰め→`LOG_LENGTH`上げる / KEY不明→ソースgrep / モジュール横断→`LOG_KEY=key1,key2`

ERRORはstderr、他はstdout。`2> stderr.log`でエラー分離、`2>&1 | tee debug.log`で全量取得。調査中ロガーは`fix-<id>`キーで作成し、`deno run --allow-read jsr:@tettuan/breakdownlogger/validate .`で本番混入を防ぐ。
