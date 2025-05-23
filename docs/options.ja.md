# オプション仕様

このドキュメントは、breakdownparamsライブラリのオプション（ハイフン付き引数）の仕様を定義します。

## オプション一覧

| オプション | エイリアス | 説明 | 値の型 | 必須 | 例 |
|------------|------------|------|--------|------|-----|
| --help | -h | ヘルプ情報を表示 | boolean | いいえ | `--help` |
| --version | -v | バージョン情報を表示 | boolean | いいえ | `--version` |
| --from | -f | ソースファイルパス | string | いいえ | `--from input.md` |
| --destination | -o | 出力ファイルパス | string | いいえ | `--destination output.md` |
| --input | -i | 入力レイヤータイプ | enum | いいえ | `--input project` |
| --adaptation | -a | プロンプト適応タイプ | string | いいえ | `--adaptation strict` |

## オプションの制約

1. **長形式と短縮形**
   - 両方の形式が提供された場合（例：`--from`と`-f`）、長形式が優先されます
   - 長形式が主要で、短縮形はエイリアスと見なされます

2. **大文字小文字の区別**
   - すべてのオプションとエイリアスは小文字である必要があります
   - 大文字バリアントはエラーなしで無視されます

3. **無効なオプション**
   - 未定義のオプションはエラーなしで無視されます
   - ファイルパスに対する検証は行われません

## 入力レイヤータイプの値

`--input`オプションを使用する場合、以下の値がサポートされます：

| 入力値 | 説明 |
|--------|------|
| project, pj | プロジェクト |
| issue, story | 課題 |
| task, todo, chore, style, fix, error, bug | タスク |

## 使用例

### ヘルプとバージョン
```bash
breakdown --help
breakdown -v
```

### ファイル操作
```bash
breakdown to issue --from input.md --destination output.md
breakdown to issue -f input.md -o output.md
```

### レイヤータイプ指定
```bash
breakdown summary task --input project
breakdown summary task -i project
```

### プロンプト適応
```bash
breakdown summary task --adaptation strict
breakdown summary task -a strict
```

### 複合使用
```bash
breakdown to issue --from input.md -o output.md -i project -a strict
``` 