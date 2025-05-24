# @tettuan/breakdownparams

タスク分解のためのコマンドライン引数パーサー。このモジュールはタスク分解操作のためのコマンドライン引数を解析する機能を提供します。

パラメータパターンと使用方法の詳細については、[詳細ドキュメント](docs/index.md)を参照してください。

## インストール

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@0.1.0';
```

## 使用方法

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@0.1.0';

const parser = new ParamsParser();

// 引数の解析
const result = parser.parse(Deno.args);

// 異なる結果タイプの処理
switch (result.type) {
  case 'no-params':
    if (result.help) {
      console.log('ヘルプメッセージを表示');
    }
    if (result.version) {
      console.log('バージョンを表示');
    }
    break;

  case 'single':
    if (result.command === 'init') {
      console.log('プロジェクトの初期化');
    }
    break;

  case 'double':
    console.log(`指示タイプ: ${result.demonstrativeType}`);
    console.log(`レイヤー: ${result.layerType}`);
    if (result.options.fromFile) {
      console.log(`入力ファイル: ${result.options.fromFile}`);
    }
    break;
}
```

## API

### `ParamsParser`

コマンドライン引数を解析するためのメインクラス。

#### メソッド

- `parse(args: string[]): ParamsResult`
  コマンドライン引数を解析し、構造化された結果を返します。

### 結果タイプ

コマンドライン引数に基づいて、以下の結果タイプが利用可能です。各タイプで利用可能なオプションの詳細については、[オプション ドキュメント](docs/options.md)を参照してください。

- `NoParamsResult`: パラメータなしのコマンドまたはヘルプ/バージョンフラグ用
- `SingleParamResult`: "init"などの単一コマンド用
- `DoubleParamsResult`: 指示タイプとレイヤータイプを持つコマンド用

### オプション

- `--from` または `-f`: ソースファイルを指定
- `--destination` または `-o`: 出力ファイルを指定
- `--input` または `-i`: 入力レイヤータイプを指定

各結果タイプで利用可能なオプションの完全なリストについては、[オプション ドキュメント](docs/options.md)を参照してください。

## 高度な機能

### カスタム変数オプション
`--uv-*`形式を使用して、タスク分解で使用するカスタム変数を定義できます。これらの変数はテンプレートで参照でき、処理中に値に置き換えられます。

例:
```bash
breakdown to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production
```

### 拡張パラメータ
パーサーは、より複雑なタスク分解シナリオを可能にする拡張パラメータ機能をサポートしています。これには以下が含まれます：
- パラメータ値のカスタム検証ルール
- タスク関係のための拡張指示タイプ
- カスタムタスク階層のためのレイヤータイプ拡張
- 検証失敗のためのカスタムエラーメッセージ

例:
```bash
breakdown to project --extended --custom-validation --error-format=detailed
```

### 設定ファイルオプション
デフォルトのオプションと動作を設定するために設定ファイルを使用できます。設定ファイルは以下をサポートします：
- 一般的な操作のためのデフォルトパラメータ値
- 特定のユースケースのためのカスタム検証ルール
- 複雑なシナリオのための拡張パラメータ設定
- 異なるデプロイメント段階のための環境固有の設定

設定例:
```json
{
  "defaults": {
    "demonstrativeType": "to",
    "layerType": "project"
  },
  "validation": {
    "customRules": ["rule1", "rule2"]
  },
  "extended": {
    "enabled": true,
    "customTypes": ["type1", "type2"]
  }
}
```

## 例

`examples/`ディレクトリには、パーサーの異なる側面を示す3つのCLI例が含まれています：

1. `basic_usage.ts`: 基本的なコマンド解析とヘルプ表示
   ```bash
   # ヘルプを表示
   deno run examples/basic_usage.ts --help

   # プロジェクトの初期化
   deno run examples/basic_usage.ts init

   # タスクをイシューに変換
   deno run examples/basic_usage.ts to issue --from input.md
   ```

2. `error_handling.ts`: エラー処理と検証のデモ
   ```bash
   # 利用可能なエラー例を表示
   deno run examples/error_handling.ts --help

   # 異なるエラーケースを試す
   deno run examples/error_handling.ts unknown
   deno run examples/error_handling.ts to issue extra
   ```

3. `options_usage.ts`: コマンドラインオプションの使用方法
   ```bash
   # オプションヘルプを表示
   deno run examples/options_usage.ts --help

   # 異なるオプションフォーマットを試す
   deno run examples/options_usage.ts to issue --from input.md --destination output.md
   deno run examples/options_usage.ts to issue -f input.md -o output.md
   ```

各例には詳細なヘルプテキストと使用方法が含まれています。利用可能なオプションを確認するには`--help`を付けて実行してください。

## 開発

### 前提条件

- Deno
- GitHub CLI (`gh`)
- `jq`コマンドラインツール

### テスト

```bash
deno task test
```

## パブリッシュ

パッケージはGitHub Actionsを使用してJSRにパブリッシュされます。新しいバージョンをパブリッシュするには：

1. すべての変更がコミットされ、プッシュされていることを確認
2. リリースを準備するためにパブリッシュスクリプトを実行：

```bash
./scripts/publish.sh
```

このスクリプトは以下を実行します：

- 未コミットの変更をチェック
- GitHub Actionsのテストが成功したことを確認
- `deno.lock`を再生成
- フォーマット、リント、テストチェックを実行
- 更新されたロックファイルをコミットしてプッシュ

## バージョン管理

バージョンを上げて新しいリリースを作成するには：

```bash
./scripts/bump_version.sh
```

このスクリプトは以下を実行します：

- 未コミットの変更をチェック
- GitHub Actionsのテストが成功したことを確認
- JSRから最新バージョンをチェック
- 最新のJSRバージョンより新しいタグを削除
- パッチバージョンをインクリメント
- `deno.json`を更新
- 新しいgitタグを作成してプッシュ

タグがプッシュされると、新しいバージョンが自動的にJSRにパブリッシュされます。

## ライセンス

MITライセンス - 詳細はLICENSEファイルを参照してください。

---

[English Version](README.md) | [日本語版](README.ja.md) 