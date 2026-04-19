# 開発者向けドキュメント

## 概要

breakdownparamsは、コマンドライン引数を解析し構造化されたパラメータデータを提供するDenoライブラリです。
パラメータの解析とバリデーション、値の保持に特化し、シンプルで堅牢な実装を目指します。

## 設計原則

1. **単一責任**
   - パラメータの解析と保持のみを行う
   - パラメータの意味解釈は行わない
   - パス値の加工は行わない（normalize/resolve、ファイルシステムアクセスはしない）
   - デフォルト値は持たない（バリデーション失敗時はエラーを返す）
   - 後述の「セキュリティ検査」に記載した最小限の検査のみを実施する

2. **明確なインターフェース**
   - 入力：文字列配列（コマンドライン引数）
   - 出力：型付けされたパラメータオブジェクト
   - エラー：明確なエラーメッセージ
   - バリデーション失敗時は該当パラメータを含まないエラー結果を返す

3. **オプションクラス中心設計**
   - 各オプションインスタンスが自身の正規化ロジックを保持
   - Optionクラスが自身のバリデーションを管理
   - システム全体で統一された正規化ルール
   - OptionFactoryがCLI引数から適切なOptionインスタンスを生成

## 実装仕様

### 1. 型定義

パラメータの種類は、位置引数の数に基づいて3つのタイプに分類されます：

1. **ZeroParams**
   - 位置引数なし
   - オプションのみ指定可能
   - 例：`breakdown --help`

2. **OneParam**
   - 位置引数1つ
   - 有効な値：`init`
   - 例：`breakdown init`

3. **TwoParams**
   - 位置引数2つ
   - 形式：`<directiveType> <layerType>`
   - 例：`breakdown to project`

各タイプの詳細な型定義と使用方法については、[パラメータパーサーの型定義仕様](params_type.ja.md)を参照してください。

### 2. オプション定義

オプションは、ハイフン付きの引数として指定されます。各オプションは長形式と短縮形の両方をサポートします：

| ロングフォーム | ショートハンド | 説明                     | 正規化形式 |
| -------------- | -------------- | ------------------------ | ------------ |
| --help         | -h             | ヘルプ表示               | `help`       |
| --version      | -v             | バージョン表示           | `version`    |
| --from         | -f             | 入力ファイル指定         | `from`       |
| --destination  | -o             | 出力ファイル指定         | `destination`|
| --edition      | -e             | エディションレイヤー指定 | `edition`    |
| --adaptation   | -a             | プロンプト適応タイプ指定 | `adaptation` |
| --config       | -c             | 設定ファイル名指定       | `config`     |
| --uv-*         | なし           | ユーザー変数オプション指定 | `uv-*`       |

### オプションの正規化

すべてのオプションは統一された正規化ルールに従います：
- 正規形式では先頭のハイフンを除去
- エイリアスは主要名に解決
- 例：
  - `--help` → `help`
  - `-h` → `help`
  - `--uv-config` → `uv-config`

### 3. バリデーション規則

1. **引数の数**
   - 0個：オプションのみ許可
   - 1個：`init`コマンドのみ許可
   - 2個：directiveTypeとlayerTypeの組み合わせ
   - 3個以上：エラー

2. **値の制約**
   - エイリアスは小文字のみ有効
   - 未定義のエイリアスは無視
   - ロングフォームが優先（ショートハンドと競合時）
   - オプションの重複時は最後の指定が有効

3. **オプションの優先順位**
   - ロングフォーム（--from, --destination, --edition）が優先
   - ショートハンド（-f, -o, -e）はロングフォームが未指定の場合のみ有効
   - 同じオプションが複数回指定された場合、最後の指定が有効

4. **大文字小文字の扱い**
   - レイヤータイプのエイリアスは小文字のみ有効
   - 大文字を含むエイリアスは無効として扱う
   - ユーザー変数オプション名は大文字小文字を区別し、指定された通りに使用

5. **ユーザー変数オプションの制約**
   - TwoParamsモードでのみ使用可能
   - 構文は`--uv-<name>=<value>`の形式を厳守
   - 変数名は英数字と最小限の特殊文字のみ許可
   - 値は文字列として扱い、検証は行わない
   - 内部的に`uv-*`形式に正規化（先頭のハイフンを除去）

### 4. エラー定義

エラーは、発生した問題の種類に応じて適切なメッセージを返します：

| エラーケース       | メッセージ例                                           |
| ------------------ | ------------------------------------------------------ |
| 引数過多           | "Too many arguments. Maximum 2 arguments are allowed." |
| 不正な値           | "Invalid directive type. Must be one of: to, summary, defect" |
| 必須パラメータ不足 | "Missing required parameter: {param}"                  |
| ユーザー変数オプション構文エラー | "Invalid user variable option syntax: {value}"    |

## 使用例

### 基本的な使用例

```typescript
import { ParamsParser } from './mod.ts';

// デフォルト設定値でパーサーを初期化
const parser = new ParamsParser();

// パラメータなし
parser.parse([]);
// { type: "zero-params", help: false, version: false }

// ヘルプ表示
parser.parse(['-h']);
// { type: "zero-params", help: true, version: false }

// 初期化
parser.parse(['init']);
// { type: "one", command: "init" }

// 2パラメータ
parser.parse(['to', 'issue', '--from', './input.md']);
// {
//   type: "two",
//   directiveType: "to",
//   layerType: "issue",
//   options: { fromFile: "./input.md" }
// }

// 複合オプション
parser.parse(['summary', 'task', '--from', './tasks.md', '-a', 'strict']);
// {
//   type: "two",
//   directiveType: "summary",
//   layerType: "task",
//   options: { fromFile: "./tasks.md", adaptation: "strict" }
// }
```

### カスタム設定値での使用例

```typescript
// カスタム設定値でパーサーを初期化
const customConfig = {
  directiveType: {
    pattern: '^[a-z]+$',  // 小文字のアルファベットのみ許可
    errorMessage: 'Invalid directive type'
  },
  layerType: {
    pattern: '^[a-z]+$',  // 小文字のアルファベットのみ許可
    errorMessage: 'Invalid layer type'
  }
};

const customParser = new ParamsParser(customConfig);

// カスタム設定値での2パラメータ
customParser.parse(['custom', 'layer', '--from', './input.md']);
// {
//   type: "two",
//   directiveType: "custom",
//   layerType: "layer",
//   options: { fromFile: "./input.md" }
// }
```

### ユーザー変数オプションを含む2パラメータ

```typescript
// ユーザー変数オプションを含む2パラメータ（正規化済み）
parser.parse(['to', 'project', '--uv-project=myproject', '--uv-version=1.0.0']);
// {
//   type: "two",
//   directiveType: "to",
//   layerType: "project",
//   options: {
//     "uv-project": "myproject",  // --uv-projectから正規化
//     "uv-version": "1.0.0"       // --uv-versionから正規化
//   }
// }
```

## セキュリティ検査

パーサーは宣言的な 2 フェーズのセキュリティバリデータを内蔵します。利用者は `CustomConfig.security.policy` を通じて意図を表明し、バリデータがそれをカテゴリごとの正規表現検査に変換します。既定ポリシーは全カテゴリ `'safe'` です。明示設定なしでも代表的なインジェクション・トラバーサル攻撃パターンを拒否します。`'safe'` 適用時もパーサーは値を normalize / resolve / stat しません。下記の正規表現検査のみを実施します。

### 5 つのカテゴリ

| カテゴリ            | 拒否する内容                                                                          | 適用範囲                                       |
|--------------------|--------------------------------------------------------------------------------------|---------------------------------------------|
| `shellInjection`   | シェル制御メタ文字（`;`, `|`, `&`, `<`, `>`、`strict` ではバッククォート / `$` / 改行 / `$( )` も）   | **全引数対象**。Phase 1 で raw args を検査。     |
| `absolutePath`     | POSIX 絶対パス（`/x`）。`strict` は Windows ドライブ / UNC パスも拒否                          | Phase 2、`kind: 'path'` のオプションのみ。       |
| `homeExpansion`    | `~/x`（`strict` では `~` 単体も）                                                     | Phase 2、`kind: 'path'` のオプションのみ。       |
| `parentTraversal`  | `..` トラバーサル（`../`, `..\\`, 末尾の `..`）。`strict` は URL エンコード `%2e%2e` も対象       | Phase 2、`kind: 'path'` のオプションのみ。       |
| `specialChars`     | 制御文字 `\x00`–`\x1F` および `\x7F`。`strict` は `\x7F`–`\x9F` まで拡張                  | Phase 2、`kind: 'path'` のオプションのみ。       |

`shellInjection` を全引数対象としているのは、Phase 1 がオプション解決前に走るためオプション識別が不可能だからです。残り 4 カテゴリは *path-kind 限定* です。組み込みの `--from` / `--destination` は既定で `kind: 'path'`、その他組み込み value option（`--input`, `--adaptation`, `--config`, `--edition`）は既定で `kind: 'text'`。利用者が定義する value option も既定で `kind: 'text'` です。

### カテゴリごとの 3 レベル

各カテゴリは 3 レベルを取ります。

| レベル     | 動作                                                                       |
|-----------|----------------------------------------------------------------------------|
| `'off'`   | 無効。検査を行いません。                                                     |
| `'safe'`  | 既定。誤検知の少ない高確度パターンを拒否。                                     |
| `'strict'`| パターン集合をさらに拡大。エンコード変種・追加メタ文字まで対象。                  |

### 動作マトリクス

各レベルで適用される正規表現の実体です。

| Category × Level | `off` | `safe` | `strict` |
|---|---|---|---|
| `shellInjection`  | （検査なし） | `/[;\|&<>]/` | `/[;\|&<>` `` ` `` `$\n\r]\|\$\(/` |
| `absolutePath`    | （検査なし） | `/^\/(?!\/)/` | `/^(\/\|[A-Za-z]:[\/\\]\|\\\\[^\\]+\\)/` |
| `homeExpansion`   | （検査なし） | `/^~(?:\/\|$)/` | `/^~/` |
| `parentTraversal` | （検査なし） | `/\.\.[\/\\]\|\.\.$/` | `/\.\.[\/\\]\|\.\.$\|%2[Ee]%2[Ee]\|%2[Ee]\.\|\.%2[Ee]/` |
| `specialChars`    | （検査なし） | `/[\x00-\x1F\x7F]/` | `/[\x00-\x1F\x7F-\x9F]/` |

safe レベルでの具体例：

- `shellInjection safe`: `--from=foo;rm` は拒否。`foo$bar` は通過（`$` を拒否するのは `strict` のみ）。
- `absolutePath safe`: `--from=/etc/passwd` は拒否。`--from=//double` は safe を通過（負の先読みで許可。`strict` では先頭スラッシュ分岐で拒否）。
- `homeExpansion safe`: `--from=~/data` と `--from=~` は拒否。`--from=~README` は safe を通過するが `strict` では拒否。
- `parentTraversal safe`: `--from=../sibling`, `--from=foo/..` は拒否。`--from=..README` は通過（`..` の後に `/` も `\` も無いため）。
- `specialChars safe`: `--from=name\x00` は拒否。高位ビット `\x80`–`\x9F` は `strict` でのみ反応。

### 2 フェーズアーキテクチャ

検査は `ParamsParser.parse(...)` 内で 2 段に分かれます。

1. **Phase 1（`SecurityValidator.validatePhase1(args)`）** は raw args 配列に対し、オプション解決前に走ります。`shellInjection` のみを実施。他カテゴリはオプション識別が必要なためここでは対象外です。
2. **Phase 2（`SecurityValidator.validatePhase2(input)`）** はオプションファクトリが各引数を正規オプション名と値に解決した後に走ります。各解決済みオプションについて `kind` と `securityPolicy` を引いて `resolveEffectivePolicy(...)` を呼び、**先勝ちの順序** `shellInjection` → `absolutePath` → `homeExpansion` → `parentTraversal` → `specialChars` で値を検査します。

ユーザー変数オプション（`--uv-*`）と裸の位置引数は `kind` を持たないため、4 つのパス系カテゴリの対象外です。Phase 1 の `shellInjection` 検査は引き続き適用されます。

### 既定動作

`CustomConfig.security` を省略した場合、ランタイムは `{ policy: 'safe' }` を全カテゴリに適用したものとして扱います。レガシーな `validate(args)` エントリポイント（standalone なユニットテストで使用）は、`--uv-*` 以外の全引数に対し v1.2.x 互換の `parentTraversal safe` 検査を追加で実施します。これにより `ParamsParser` を経由しない v1.2.x 利用者でも従来のトラバーサル動作が維持されます。

### オプション単位オーバーライドのセマンティクス

各 value `OptionDefinition` は独自の `securityPolicy` を持てます。リゾルバはある値に対するポリシーを次の順でマージします。

1. グローバルな `CustomConfig.security.policy` を全カテゴリのレベルマップに展開（未指定キーは `'safe'` にフォールバック）。
2. オプション単位ポリシーが単一の `Level` 文字列なら、そのレベルを全カテゴリに一律適用。
3. 部分マップなら、利用者が指定したキーのみオーバーライド。
4. 当該オプションの `kind` が `'path'` でなければ、マージ結果に関わらず `absolutePath` / `homeExpansion` / `parentTraversal` / `specialChars` を `'off'` に強制。

**制約: オプション単位の `securityPolicy` で `shellInjection` を緩めることはできません。** Phase 1 はオプション識別を持たない時点で走るため、`shellInjection` のオプション単位オーバーライドは Phase 1 では無効化されます（Phase 2 自体はパス値に対し `shellInjection` を再実行しません — `shellInjection` は path-kind 非依存）。具体的には、あるオプションに `securityPolicy: { shellInjection: 'off' }` を指定しても、グローバルポリシーが `'safe'` ならその値に `;` を含めることはできません。

### 行わないこと

- パスの normalize / resolve（`path.normalize`, `path.resolve` は呼ばない）
- ファイルシステムへのアクセス（存在確認・権限確認・stat など）
- ディレクトリ走査
- パスのホワイトリスト / ブラックリスト判定
- 上記の正規表現検査を超える値の意味解釈

### エラーメッセージ形式

拒否時は `ErrorResult` を返し、`error.code` は `SECURITY_ERROR`、`error.category` は `security`、`error.message` は次の正準形式に統一されます。

```
Security error: <category> violation in <context>
```

`<context>` は `option <name>`（`--name=...` / `-x=...` の場合）、`argument`（`--uv-*` の場合）、`positional`（裸の位置引数の場合）のいずれかです。

## 制約事項

1. **非対応機能**
   - パラメータの意味解釈
   - パスの正規化・解決（上記の最小限のトラバーサル検査のみを実施）
   - ファイルシステムへのアクセス全般
   - 大文字小文字の正規化（レイヤータイプのエイリアスを除く）
   - ユーザー変数オプションの値の検証（構文チェックのみ）

2. **制限事項**
   - パラメータは最大2個まで
   - エイリアスは小文字のみ
   - パス文字列の加工なし（最小限のセキュリティ検査を除く）
   - オプションの重複時は最後の指定が有効
   - ユーザー変数オプションはTwoParamsモードでのみ使用可能

## アーキテクチャ概要

### 主要コンポーネント

1. **OptionFactory**
   - コマンドライン引数からOptionインスタンスを生成
   - オプションタイプ（ValueOption、FlagOption、UserVariableOption）を判定
   - 標準オプション定義とエイリアス管理

2. **Optionクラス**
   - `ValueOption`: 値を受け取るオプション
   - `FlagOption`: 値を持たないブールオプション
   - `UserVariableOption`: `--uv-*`プレフィックスのユーザー定義変数
   - 各クラスがOptionインターフェースを実装し、正規化とバリデーションを実装

3. **ParamsParser**
   - OptionFactoryを使用してOptionインスタンスを生成
   - Optionインスタンスから正規化された値を抽出
   - バリデーションをOptionインスタンスに委譲
   - 構造化されたパラメータ結果を返却

4. **Validators**
   - 正規化されたOptionインスタンスを扱う
   - 正規化処理を持たない（Optionクラスに委譲）
   - 純粋なバリデーションロジックに集中

## テスト戦略

1. **単体テスト**
   - パラメータ解析
   - オプション解析
   - バリデーション
   - エラー処理

2. **統合テスト**
   - 完全なコマンドライン引数の解析
   - エラーケースの処理
   - エイリアスの処理

3. **エッジケース**
   - 空の引数
   - 不正な形式
   - 未定義のオプション
   - 大文字小文字の混在

---

[日本語版](development.ja.md) | [English Version](development.md)
