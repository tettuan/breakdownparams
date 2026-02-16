---
name: local-ci
description: Run local CI checks before merge or push. Use when user says 'CI', 'ローカルCI', or before creating PRs.
allowed-tools: [Bash, Read]
---

push/マージ前に品質を保証するため、ローカルCIパイプラインを実行する。

1. `deno task ci` 実行
2. エラー時は `LOG_LEVEL=debug deno task ci` で詳細確認

パイプライン: check(型検査) → test(全テスト) → fmt(フォーマット) → lint(リント)

全チェック通過までpush禁止。
