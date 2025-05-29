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
   - 形式：`<demonstrativeType> <layerType>`
   - 例：`breakdown to project`

各タイプの詳細な型定義と使用方法については、[パラメータパーサーの型定義仕様](params_type.ja.md)を参照してください。

### 2. オプション定義

オプションは、ハイフン付きの引数として指定されます。各オプションは長形式と短縮形の両方をサポートします：

| ロングフォーム | ショートハンド | 説明                     |
| -------------- | -------------- | ------------------------ |
| --help         | -h             | ヘルプ表示               |
| --version      | -v             | バージョン表示           |
| --from         | -f             | 入力ファイル指定         |
| --destination  | -o             | 出力ファイル指定         |
| --input        | -i             | 入力レイヤー指定         |
| --adaptation   | -a             | プロンプト適応タイプ指定 |
| --config       | -c             | 設定ファイル名指定       |
| --uv-*         | なし           | カスタム変数オプション指定 |

### 3. バリデーション規則

1. **引数の数**
   - 0個：オプションのみ許可
   - 1個：`init`コマンドのみ許可
   - 2個：demonstrativeTypeとlayerTypeの組み合わせ
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
   - カスタム変数オプション名は大文字小文字を区別し、指定された通りに使用

5. **カスタム変数オプションの制約**
   - TwoParamsモードでのみ使用可能
   - 構文は`--uv-<name>=<value>`の形式を厳守
   - 変数名は英数字と最小限の特殊文字のみ許可
   - 値は文字列として扱い、検証は行わない

### 4. エラー定義

エラーは、発生した問題の種類に応じて適切なメッセージを返します：

| エラーケース       | メッセージ例                                           |
| ------------------ | ------------------------------------------------------ |
| 引数過多           | "Too many arguments. Maximum 2 arguments are allowed." |
| 不正な値           | "Invalid value for demonstrativeType: {value}"         |
| 必須パラメータ不足 | "Missing required parameter: {param}"                  |
| カスタム変数オプション構文エラー | "Invalid custom variable option syntax: {value}"  |

## 使用例

### 基本的な使用例

```typescript
import { ParamsParser } from './mod.ts';

const parser = new ParamsParser();

// パラメータなし
parser.parse([]);
// { type: "no-params", help: false, version: false }

// ヘルプ表示
parser.parse(['-h']);
// { type: "no-params", help: true, version: false }

// 初期化
parser.parse(['init']);
// { type: "one", command: "init" }

// 2パラメータ
parser.parse(['to', 'issue', '--from', './input.md']);
// {
//   type: "two",
//   demonstrativeType: "to",
//   layerType: "issue",
//   options: { fromFile: "./input.md" }
// }

// 複合オプション
parser.parse(['summary', 'task', '--from', './tasks.md', '-a', 'strict']);
// {
//   type: "two",
//   demonstrativeType: "summary",
//   layerType: "task",
//   options: { fromFile: "./tasks.md", adaptation: "strict" }
// }
```

### カスタム変数オプションを含む2パラメータ

```typescript
// カスタム変数オプションを含む2パラメータ
parser.parse(['to', 'project', '--uv-project=myproject', '--uv-version=1.0.0']);
// {
//   type: "two",
//   demonstrativeType: "to",
//   layerType: "project",
//   options: {
//     customVariables: {
//       "project": "myproject",
//       "version": "1.0.0"
//     }
//   }
// }
```

## 制約事項

1. **非対応機能**
   - パラメータの意味解釈
   - パスの検証・正規化
   - 大文字小文字の正規化（レイヤータイプのエイリアスを除く）
   - カスタム変数オプションの値の検証（構文チェックのみ）

2. **制限事項**
   - パラメータは最大2個まで
   - エイリアスは小文字のみ
   - パス文字列の加工なし
   - オプションの重複時は最後の指定が有効
   - カスタム変数オプションはTwoParamsモードでのみ使用可能

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
