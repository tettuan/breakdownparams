---
name: implement-logger
description: Use when implementing features, adding code, or placing BreakdownLogger in source. Guides KEY naming, placement strategy, and validation. Trigger words - 'implement', '実装', 'add logger', 'ロガー追加', 'KEY naming', 'validate usage'.
allowed-tools: Read, Grep, Glob, Bash
---

# Implement Logger

KEY命名とロガー配置はデバッグ精度を決める設計判断なので、命名重複・配置ミス・本番混入を事前に防ぐ。

## KEY Discovery

重複KEYはフィルタリングを破壊するので、新規作成前に検索する: `grep -rn 'new BreakdownLogger(' --include='*.ts' | grep -oP '"[^"]*"' | sort -u`

既存KEYあり→再利用 / 広すぎ→sub-key作成 / なし→新規作成 / 一時調査→`fix-<issue>`prefixで作成後削除

## KEY命名

方式: By feature(`auth`,`payment`) / By layer(`controller`,`service`) / By flow(`order-auth`)。制約: lowercase kebab-case、汎用名禁止(`util`,`helper`)、論理単位ごとにユニーク。

## 配置

データは境界で変換されるので、4境界点（引数受信後・値返却前・外部呼出前後・エラーハンドラ内）に置く。タイトループ内・全行後・dataパラム無し・循環参照オブジェクトは禁止。

## 記述

`LOG_LENGTH`は末尾切り詰めなので重要情報を先頭40字に置く: `logger.debug("Timeout: DB conn exceeded 30s", { host });`

## 検証

BreakdownLoggerはテスト専用なので、`deno run --allow-read jsr:@tettuan/breakdownlogger/validate [target-dir]` で非テストファイルの混入を検出する。
