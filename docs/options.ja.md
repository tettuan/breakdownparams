# オプション仕様

このドキュメントは、breakdownparamsライブラリのオプション（ハイフン付き引数）の仕様を定義します。

## オプションクラスアーキテクチャ

このライブラリは、各オプションインスタンスが独自の正規化、検証、変換ロジックを保持するオプションクラス中心の設計を採用しています。この設計により以下が実現されます：

- **単一責任原則**: 各オプションクラスが自身の動作を管理
- **一貫性**: システム全体で統一された正規化ルール
- **拡張性**: 新しいオプションタイプの追加が容易
- **カプセル化**: 内部表現と外部インターフェースの分離

## 引数フォーマット

オプション引数は以下のフォーマットに従う必要があります：

### 正しいフォーマット
- `--option=value` (長形式)
- `-o=value` (短縮形)
- `--option=` (空値指定)
- `--option=""` (空文字列指定)
- `--option=''` (空文字列指定)

### 誤ったフォーマット
- `--option value` (スペース区切りは非対応)
- `-o value` (スペース区切りは非対応)

### 空値の指定方法
オプションの値を空にする場合は、以下のいずれかの方法を使用します：

1. イコール記号のみ指定：
   ```bash
   --option=
   ```

2. 空文字列を指定：
   ```bash
   --option=""
   --option=''
   ```

## オプション一覧

| オプション    | エイリアス | 説明                 | 値の型  | 必須   | 例                        |
| ------------- | ---------- | -------------------- | ------- | ------ | ------------------------- |
| --help        | -h         | ヘルプ情報を表示     | boolean | いいえ | `--help`                  |
| --version     | -v         | バージョン情報を表示 | boolean | いいえ | `--version`               |
| --from        | -f         | ソースファイルパス   | string  | いいえ | `--from=input.md`         |
| --destination | -o         | 出力ファイルパス     | string  | いいえ | `--destination=output.md` |
| --input       | -i         | 入力レイヤータイプ   | enum    | いいえ | `--input=project`         |
| --adaptation  | -a         | プロンプト適応タイプ | string  | いいえ | `--adaptation=strict`     |
| --config      | -c         | 設定ファイル名       | string  | いいえ | `--config=test`           |
| --uv-*        | なし       | ユーザー変数オプション | string  | いいえ | `--uv-project=myproject`  |

## オプションの制約

1. **長形式と短縮形**
   - 両方の形式が提供された場合（例：`--from`と`-f`）、長形式が優先されます
   - 長形式が主要で、短縮形はエイリアスと見なされます
   - ユーザー変数オプション（`--uv-*`）は短縮形をサポートしません

2. **大文字小文字の区別**
   - すべてのオプションとエイリアスは小文字である必要があります
   - 大文字バリアントはエラーなしで無視されます
   - ユーザー変数オプション名は大文字小文字を区別し、指定された通りに使用する必要があります

3. **無効なオプション**
   - 未定義のオプションはエラーなしで無視されます
   - ファイルパスに対する検証は行われません
   - ユーザー変数オプションの構文が不正な場合（`=`の欠落など）はエラーとなります

4. **パラメータタイプによる制約**
   - `--config` / `-c` オプションは TwoParams でのみ使用可能です
   - ユーザー変数オプション（`--uv-*`）も TwoParams でのみ使用可能です
   - 他のパラメータタイプ（ZeroParams, OneParam, TwoParams）では無視されます

## 入力レイヤータイプの値

`--input`オプションを使用する場合、２番目パラメータのバリデーションルールを使います：


## 使用例

### ヘルプとバージョン

```bash
breakdown --help
breakdown -v
```

### ファイル操作

```bash
# 正しいフォーマット
breakdown to issue --from=input.md --destination=output.md
breakdown to issue -f=input.md -o=output.md

# 空値指定の例
breakdown to issue --from= --destination=""
breakdown to issue -f='' -o=
```

### レイヤータイプ指定

```bash
# 正しいフォーマット
breakdown summary task --input=project
breakdown summary task -i=project

# 空値指定の例
breakdown summary task --input=
breakdown summary task -i=""
```

### プロンプト適応

```bash
# 正しいフォーマット
breakdown summary task --adaptation=strict
breakdown summary task -a=strict

# 空値指定の例
breakdown summary task --adaptation=
breakdown summary task -a=''
```

### ユーザー変数オプション

```bash
# 正しいフォーマット
breakdown to project --uv-project=myproject
breakdown to project --uv-version=1.0.0 --uv-environment=production

# 空値指定の例
breakdown to project --uv-project= --uv-version=""
```

### 複合使用

```bash
# 正しいフォーマット
breakdown to issue --from=input.md -o=output.md -i=project -a=strict
breakdown to project --config=test
breakdown summary task -c=test
breakdown to project --config=test --uv-environment=prod --uv-version=1.0.0

# 空値指定を含む例
breakdown to issue --from= -o="" -i=project -a=
breakdown to project --config= --uv-environment="" --uv-version=
```

## オプションの正規化

ライブラリは統一された正規化アプローチを使用します：
- ショートオプション（`-h`）は内部的に正規名（`help`）に正規化されます
- ロングオプション（`--help`）も正規名（`help`）に正規化されます
- ユーザー変数オプション（`--uv-config`）は`uv-config`に正規化されます（先頭のハイフンを除去）
- 各オプションクラスが独自の正規化ロジックを処理します

## 返却型

オプションの解析結果は、パラメータの型に含まれて返却されます：

```typescript
type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
  adaptationType?: string;
  configFile?: string;
  [key: `uv-${string}`]: string; // ユーザー変数は先頭のハイフンを除去して正規化
};
```

各型の詳細な定義と使用方法については、[パラメータパーサーの型定義仕様](params_type.ja.md)を参照してください。

---

[日本語版](options.ja.md) | [English Version](options.md)
