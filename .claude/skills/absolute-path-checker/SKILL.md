---
name: absolute-path-checker
description: Verify no absolute paths exist in implementation code when discussing tests, refactoring, portability, or directory hierarchy
allowed-tools: [Grep, Read, Edit, Bash]
---

# Absolute Path Checker

ポータビリティを保つため、実装コード（src/）に絶対パスが含まれていないことを検証する。

```bash
grep -r "/Users/\|/home/" --include="*.ts" --include="*.js" src/
```

| 種別 | 対応 |
|------|------|
| 実装内リテラル | 相対パスに変換必須 |
| テスト出力/ログ | 許容（アサーション内は不可） |
| 設定デフォルト | 環境変数または相対パスに置換 |

変換優先順: `Deno.cwd()`/プロジェクトベースパス → `import.meta.url`で`__dirname`相当取得 → 相対パスリテラル

`$HOME`/`~`も絶対パス扱い。`Deno.env.get("HOME")`は許容。パス結合には`join()`/`resolve()`を使い文字列連結しない。
