# 結果タイプ別オプション

このドキュメントは、breakdownparamsライブラリの各結果タイプで利用可能なオプションの包括的な概要を提供します。

## NoParamsResult

位置引数が提供されていない場合に利用可能なオプション。

| オプション | エイリアス | 説明 | 値の型 | 必須 |
|------------|------------|------|--------|------|
| --help | -h | ヘルプ情報を表示 | boolean | いいえ |
| --version | -v | バージョン情報を表示 | boolean | いいえ |

## SingleParamResult

単一のコマンド（例：「init」）が提供された場合に利用可能なオプション。

単一パラメータコマンドには追加のオプションはありません。有効な単一パラメータは以下のみです：
- `init`

## DoubleParamsResult

DemonstrativeTypeとLayerTypeの両方が提供された場合（例：「to issue」）に利用可能なオプション。

| オプション | エイリアス | 説明 | 値の型 | 必須 | 例 |
|------------|------------|------|--------|------|-----|
| --from | -f | ソースファイルパス | string | いいえ | `--from input.md` |
| --destination | -o | 出力ファイルパス | string | いいえ | `--destination output.md` |
| --input | -i | 入力レイヤータイプ | enum | いいえ | `--input project` |
| --adaptation | -a | プロンプト適応タイプ | string | いいえ | `--adaptation strict` |

### 入力レイヤータイプの値

`--input`オプションを使用する場合、以下の値がサポートされ、正規化されます：

| 入力値 | 正規化後の値 |
|--------|--------------|
| project, pj, prj | project |
| issue, story | issue |
| task, todo, chore, style, fix, error, bug | task |

## オプション優先順位ルール

1. 長形式と短縮形：
   - 両方の形式が提供された場合（例：`--from`と`-f`）、長形式が優先されます

2. 大文字小文字の区別：
   - すべてのオプションとエイリアスは小文字である必要があります
   - 大文字バリアントはエラーなしで無視されます

3. 無効なオプション：
   - 未定義のオプションはエラーなしで無視されます
   - ファイルパスに対する検証は行われません

## 使用例

### NoParamsResult
```bash
breakdown --help
breakdown -v
```

### SingleParamResult
```bash
breakdown init
```

### DoubleParamsResult
```bash
breakdown to issue --from input.md --destination output.md
breakdown to issue -f input.md -o output.md -i project
breakdown summary task --from unorganized_tasks.md -o task_markdown_dir -a strict
breakdown summary task -f unorganized_tasks.md -o task_markdown_dir -a a
``` 