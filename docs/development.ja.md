# 開発者向けドキュメント

## 概要

breakdownparamsは、コマンドライン引数を解析し構造化されたパラメータデータを提供するDenoライブラリです。
パラメータの解析とバリデーション、値の保持に特化し、シンプルで堅牢な実装を目指します。

## 設計原則

1. **単一責任**
   - パラメータの解析と保持のみを行う
   - パラメータの意味解釈は行わない
   - 値の加工（パス正規化など）は行わない
   - デフォルト値は持たない（バリデーション失敗時はエラーを返す）

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
| --input        | -i             | 入力レイヤー指定         | `input`      |
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
   - ロングフォーム（--from, --destination, --input）が優先
   - ショートハンド（-f, -o, -i）はロングフォームが未指定の場合のみ有効
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

## 制約事項

1. **非対応機能**
   - パラメータの意味解釈
   - パスの検証・正規化
   - 大文字小文字の正規化（レイヤータイプのエイリアスを除く）
   - ユーザー変数オプションの値の検証（構文チェックのみ）

2. **制限事項**
   - パラメータは最大2個まで
   - エイリアスは小文字のみ
   - パス文字列の加工なし
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
