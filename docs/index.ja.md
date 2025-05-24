# ライブラリ概要

このライブラリは https://jsr.io に登録されており、https://jsr.io/@tettuan/breakdown で使用されています。
ユースケースの中で、このライブラリのスコープはパラメータの解析と保存に焦点を当てています。

このライブラリは実行時パラメータを解析し、その値を保存します。
スコープは解析から検証、保存された値の返却までをカバーします。

詳細な仕様については、以下のドキュメントを参照してください：

- [パラメータ仕様](params.ja.md) - 位置引数の定義と制約
- [オプション仕様](options.ja.md) - ハイフン付き引数の定義と制約
- [カスタム変数オプション仕様](custom_variable_options.ja.md) - ユーザー定義変数の定義と制約
- [パラメータパーサーの型定義仕様](params_type.ja.md) - 返却型の定義と使用方法

## スコープ外

このライブラリは以下の機能を提供しません：

- パラメータ値の意味の解釈（例：「--helpが指定されたのでヘルプを表示する」）
- デフォルト値の提供
- カスタム変数オプションの値の検証（構文チェックのみ）

# パラメータパターン

ハイフンなしのパラメータの数に基づいて処理が分岐します。
各パターンは特定のデータ構造に対応します。これらのパターンは相互に排他的です。

- ハイフン付きオプションのみ（0パラメータ）
  - アプリケーションヘルプとバージョン表示の特別処理
- 1パラメータのみ
  - アプリケーション初期化の特別処理
- 2パラメータ
  - メインアプリケーション実行
  - ハイフン付きパラメータは追加オプションとして機能
- 3つ以上のパラメータはエラー
- パラメータなしは空のパラメータ結果を返す

# 各パラメータパターンの処理

## ハイフン付きオプションのみ（0パラメータ）

使用例：

```bash
./.deno/bin/breakdown -h
```

### 可能な値

- -h, --help
- -v, --version

エイリアスがサポートされています。
引数の存在を示します。複数のオプションを同時に指定できます。

## 単一パラメータ

使用例：

```bash
./.deno/bin/breakdown init
```

### 可能な値

- `init`

引数が何を表すかを示します。
例えば、初期化時にパラメータが`init`であることを確認できます。

## 2パラメータ

使用パターン：

```bash
./.deno/bin/breakdown $1 $2
```

例：

```bash
./.deno/bin/breakdown to issue
```

最初のオプション（$1）は`DemonstrativeType`と呼ばれます。
2番目のオプション（$2）は`LayerType`と呼ばれます。

### 可能なDemonstrativeType値

- to
- summary
- defect

### 可能なLayerType値

- project
- issue
- task

### ハイフン付きオプション値

#### --from `<file>`

オプション名：FromFile
エイリアス：`-f`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --from <file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -f <file>
```

##### FromFile値

- `<file>`部分を取得
- 例：`--from ./.agent/breakdown/issues/issue_summary.md`の場合、`./.agent/breakdown/issues/issue_summary.md`を保存

#### --destination `<output_file>`

オプション名：DestinationFile
エイリアス：`-o`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --destination <output_file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -o <output_file>
```

##### DestinationFile値

- `<output_file>`部分を取得
- 例：`--destination ./.agent/breakdown/issues/issue_summary.md`の場合、`./.agent/breakdown/issues/issue_summary.md`を保存

#### --input `<from_layer_type>`

オプション名：FromLayerType
エイリアス：`-i`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --input <from_layer_type>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -i <from_layer_type>
```

##### from_layer_type値

- `<from_layer_type>`部分を取得
- 例：`--input issue`の場合、`issue`を保存
- 許可される値：
  - project
  - issue
  - task

#### --config `<config_file>`

オプション名：ConfigFile
エイリアス：`-c`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --config <config_file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -c <config_file>
```

##### ConfigFile値

- `<config_file>`部分を取得
- 例：`--config test`の場合、`test`を保存

#### カスタム変数オプション（`--uv-*`）

カスタム変数オプションは、ユーザー定義の変数を指定するためのオプションです。
DoubleParamsモードでのみ使用可能で、以下の形式で指定します：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --uv-<name>=<value>
```

例：
```bash
./.deno/bin/breakdown to project --uv-project=myproject
./.deno/bin/breakdown to project --uv-version=1.0.0 --uv-environment=production
```

詳細な仕様については[カスタム変数オプション仕様](custom_variable_options.ja.md)を参照してください。

# パラメータ優先順位ルール

- 短縮形と長形式のオプションが両方指定された場合、長形式が優先されます。長形式が主要で、短縮形はエイリアスと見なされます。
- パス処理は行われません（値はそのまま使用）
- エイリアスは小文字である必要があります（大文字バリアントは処理されず、エラーなしで無視されます）
- 未定義のエイリアスは指定されていないものとして扱われます（エラーなしで無視されます）

---

[日本語版](index.ja.md) | [English Version](index.md)
