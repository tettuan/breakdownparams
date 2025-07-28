# @tettuan/breakdownparams

タスク分解操作のための型安全なオプションクラス中心のコマンドライン引数パーサー。このライブラリは、セキュリティと拡張性に重点を置いたコマンドライン引数の包括的な解析、検証、正規化を提供します。

パラメータパターンと使用方法の詳細については、[詳細ドキュメント](docs/index.md)を参照してください。

## 主要機能

- **型安全な解析** TypeScriptの判別共用体使用
- **オプションクラス中心設計** 一貫性と拡張性のため
- **セキュリティファースト検証** 悪意のある入力を防止
- **柔軟なパラメータパターン** （0、1、または2パラメータ）
- **カスタム変数オプション** （`--uv-*`）ユーザー定義値用
- **包括的な検証** パラメータ、オプション、組み合わせレベルで
- **統一された正規化** 一貫したオプション処理のため

## インストール

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@1.0.3';
```

## 使用方法

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@1.0.3';

const parser = new ParamsParser();

// 引数の解析
const result = parser.parse(Deno.args);

// 判別共用体による型安全な処理
switch (result.type) {
  case 'zero':
    // パラメータなし、オプションのみ
    if (result.options.help) {
      console.log('ヘルプメッセージを表示');
    }
    if (result.options.version) {
      console.log('バージョンを表示');
    }
    break;

  case 'one':
    // 指示タイプ付きの単一パラメータ
    console.log(`コマンド: ${result.directiveType}`);
    if (result.directiveType === 'init') {
      console.log('プロジェクトの初期化');
    }
    break;

  case 'two':
    // 完全なセマンティック情報を持つ2つのパラメータ
    console.log(`指示タイプ: ${result.directiveType}`);
    console.log(`レイヤータイプ: ${result.layerType}`);
    if (result.options.from) {
      console.log(`入力ファイル: ${result.options.from}`);
    }
    break;

  case 'error':
    // 包括的なエラー情報
    console.error(`エラー: ${result.error.message}`);
    console.error(`コード: ${result.error.code}`);
    console.error(`カテゴリ: ${result.error.category}`);
    break;
}
```

## アーキテクチャ概要

ライブラリは、各オプションインスタンスが独自の動作をカプセル化するオプションクラス中心設計に従います：

```
ユーザー入力 → ParamsParser → セキュリティ検証 → パラメータ/オプション分離
                ↓
        オプションファクトリ → オプションクラス（Flag/Value/UserVariable）
                ↓
        パラメータバリデーター → オプションバリデーター → 組み合わせバリデーター
                ↓
        型安全なParamsResult
```

## APIリファレンス

### `ParamsParser`

解析ワークフロー全体を統制するメインパーサークラス。

```ts
const parser = new ParamsParser(optionRule?, customConfig?);
```

#### コンストラクターパラメータ

- `optionRule?: OptionRule` - 異なるパラメータ数で許可されるオプションを定義
- `customConfig?: CustomConfig` - カスタム検証ルールと動作（2パラメータ設定を含む）

#### メソッド

- `parse(args: string[]): ParamsResult`
  - 包括的な検証でコマンドライン引数を処理
  - 型安全な処理のための判別共用体結果を返す
  - セキュリティ検証、パラメータ解析、オプション検証を実行

### 結果タイプ

パーサーは4つの可能な結果を持つ判別共用体型`ParamsResult`を返します：

#### `ZeroParamsResult`
- **いつ**: 位置パラメータが提供されない場合
- **用途**: オプションに完全に依存するコマンド
- **例**: `command --help`、`command --version`

#### `OneParamsResult`
- **いつ**: 正確に1つの位置パラメータ
- **プロパティ**: `directiveType` - パラメータのセマンティックカテゴリ
- **例**: `command init`、`command status`

#### `TwoParamsResult`
- **いつ**: 正確に2つの位置パラメータ
- **プロパティ**: 
  - `directiveType` - 最初のパラメータのセマンティックカテゴリ
  - `layerType` - 2番目のパラメータのセマンティックカテゴリ
- **例**: `command to project`、`command from issue`

#### `ErrorResult`
- **いつ**: 解析または検証が失敗した場合
- **プロパティ**: メッセージ、コード、カテゴリを含む包括的な`ErrorInfo`
- **カテゴリ**: `security`、`validation`、`invalid_format`

### 標準オプション

#### 値オプション
- `--from=<file>` または `-f=<file>`: ソースファイルパス
- `--destination=<file>` または `-o=<file>`: 出力ファイルパス
- `--input=<type>` または `-i=<type>`: 入力レイヤータイプ
- `--adaptation=<mode>`: 適応戦略
- `--config=<name>` または `-c=<name>`: 設定プロファイル

#### フラグオプション
- `--help` または `-h`: ヘルプ情報を表示
- `--version` または `-v`: バージョン情報を表示
- `--verbose`: 詳細出力を有効化
- `--experimental`: 実験的機能を有効化

### オプション正規化

すべてのオプションは内部的に正規名に正規化されます：
- 短縮形（`-h`）→ 正規名（`help`）
- 長形式（`--help`）→ 正規名（`help`）
- ユーザー変数（`--uv-config`）→ 正規名（`uv-config`）

詳細なオプション仕様については、[オプション ドキュメント](docs/options.md)を参照してください。

## 高度な機能

### カスタム変数オプション

ユーザー定義変数は最大限の柔軟性のために`--uv-*`パターンに従います：

```bash
# ワークフローのカスタム変数を定義
breakdown to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production

# コード内でアクセス
if (result.type === 'two') {
  const project = result.options['uv-project'];     // "myproject"
  const version = result.options['uv-version'];     // "1.0.0"
  const env = result.options['uv-environment'];     // "production"
}
```

**機能**:
- 無制限のカスタム変数
- 自動検証（構文のみ）
- `uv-<name>`形式に正規化
- 2パラメータモードでのみ利用可能

仕様については、[カスタム変数オプション](docs/user_variable_options.md)を参照してください。

### 検証システム

ライブラリは包括的な3層検証システムを実装しています：

#### 1. セキュリティ検証
- コマンドインジェクションとパストラバーサル攻撃を防止
- 悪意のある入力パターンに対する検証
- 解析パイプラインの最前線の防御

#### 2. パラメータ検証
- **ゼロパラメータ**: 位置引数がないことを確認
- **1つのパラメータ**: 指示タイプフォーマットを検証
- **2つのパラメータ**: 指示タイプとレイヤータイプの両方を検証
- `CustomConfig`による設定可能パターン

#### 3. オプション検証
- **存在検証**: パラメータ数でオプションが許可されているかチェック
- **値検証**: オプション値が要件を満たしているかチェック
- **組み合わせ検証**: オプションの組み合わせを検証
- **ユーザー変数検証**: `--uv-*`オプションの構文チェック

### カスタム設定

カスタム設定でパーサーの動作を拡張します：

```ts
import { ParamsParser, CustomConfig } from 'jsr:@tettuan/breakdownparams@1.0.3';

const customConfig: CustomConfig = {
  params: {
    two: {
      directiveType: {
        pattern: '^(to|from|via)$',
        errorMessage: 'Invalid directive type. Must be one of: to, from, via'
      },  // カスタム指示タイプ
      layerType: {
        pattern: '^(project|issue|task|epic)$',
        errorMessage: 'Invalid layer type. Must be one of: project, issue, task, epic'
      }  // カスタムレイヤータイプ
    }
  },
  validation: {
    zero: {
      allowedOptions: ["help", "version"],
      allowedValueOptions: []
    },
    one: {
      allowedOptions: ["verbose"],
      allowedValueOptions: ["config"]
    },
    two: {
      allowedOptions: ["verbose", "experimental"],
      allowedValueOptions: ["from", "destination", "input", "config"]
    }
  }
};

const parser = new ParamsParser(undefined, customConfig);
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

## 型システム

ライブラリは最大限の安全性のためにTypeScriptの型システムを活用します：

```ts
import type { 
  ParamsResult, 
  ZeroParamsResult, 
  OneParamsResult, 
  TwoParamsResult,
  ErrorResult,
  ErrorInfo 
} from 'jsr:@tettuan/breakdownparams@1.0.3';

// 判別共用体により型安全性を確保
function handleResult(result: ParamsResult) {
  if (result.type === 'two') {
    // TypeScriptはこれらのプロパティが存在することを知っている
    console.log(result.directiveType);
    console.log(result.layerType);
  }
  
  if (result.type === 'error') {
    // TypeScriptはここでerrorが定義されていることを知っている
    console.error(result.error.message);
  }
}
```

## 開発

### 前提条件

- Deno 2.x
- GitHub CLI (`gh`) PR作成用
- `jq` JSON処理用

### テスト

プロジェクトは包括的なテスト戦略に従います：

```bash
# すべてのテストを実行
deno task test

# カバレッジ付きで実行
deno task coverage

# CIパイプライン（フォーマット、リント、テスト）を実行
deno task ci
```

### テストカテゴリ

1. **アーキテクチャテスト** (`0_architecture_*`): 設計検証
2. **構造テスト** (`1_structure_*`): コンポーネント統合
3. **ユニットテスト** (`2_unit_*`): 個別機能
4. **実装テスト** (`tests/2_impliments/`): コアロジック
5. **組み合わせテスト** (`tests/5_combinatorial/`): エッジケース
6. **E2Eテスト** (`tests/10_e2e/`): 完全ワークフロー検証

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

## 貢献

貢献を歓迎します！以下をお守りください：

1. 既存のコードスタイルに従う（`deno fmt`で強制）
2. 新機能にテストを追加
3. 必要に応じてドキュメントを更新
4. `deno task ci`が通ることを確認

## ライセンス

MITライセンス - 詳細はLICENSEファイルを参照してください。

## 関連ドキュメント

- [アーキテクチャドキュメント](docs/architecture/)
- [APIリファレンス](docs/types/)
- [テストガイド](docs/testing.md)
- [開発ガイド](docs/development.md)

---

[English Version](README.md) | [日本語版](README.ja.md) 