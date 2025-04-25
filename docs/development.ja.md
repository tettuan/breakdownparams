# 開発者向けドキュメント

## 概要

breakdownparamsは、コマンドライン引数を解析し構造化されたパラメータデータを提供するDenoライブラリです。(JSRに登録)
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

```typescript
// パラメータの種類
type ParamsType = 'no-params' | 'single' | 'double';

// 基本型
interface ParamsResult {
  type: ParamsType;
  error?: string;
}

// パラメータなし
interface NoParamsResult extends ParamsResult {
  type: 'no-params';
  help: boolean;
  version: boolean;
}

// 単一パラメータ
interface SingleParamResult extends ParamsResult {
  type: 'single';
  command: 'init';
}

// 2パラメータ
interface DoubleParamsResult extends ParamsResult {
  type: 'double';
  demonstrativeType: DemonstrativeType;
  layerType: LayerType;
  options: OptionParams;
}

// オプション
interface OptionParams {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
  adaptation?: string;
}

// 値の定義
type DemonstrativeType = 'to' | 'summary' | 'defect';
type LayerType = 'project' | 'issue' | 'task';

// エイリアスマッピング
const LayerTypeAliasMap = {
  // project aliases
  'project': 'project',
  'pj': 'project',
  'prj': 'project',
  // issue aliases
  'issue': 'issue',
  'story': 'issue',
  // task aliases
  'task': 'task',
  'todo': 'task',
  'chore': 'task',
  'style': 'task',
  'fix': 'task',
  'error': 'task',
  'bug': 'task',
} as const;

type FromLayerTypeAlias = keyof typeof LayerTypeAliasMap;
```

### 2. オプション定義

| ロングフォーム | ショートハンド | 説明             |
| -------------- | -------------- | ---------------- |
| --help         | -h             | ヘルプ表示       |
| --version      | -v             | バージョン表示   |
| --from         | -f             | 入力ファイル指定 |
| --destination  | -o             | 出力ファイル指定 |
| --input        | -i             | 入力レイヤー指定 |
| --adaptation   | -a             | プロンプト適応タイプ指定 |

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
   - オプションの値（fromLayerType）は小文字に正規化して処理

### 4. エラー定義

| エラーケース       | メッセージ例                                           |
| ------------------ | ------------------------------------------------------ |
| 引数過多           | "Too many arguments. Maximum 2 arguments are allowed." |
| 不正な値           | "Invalid value for demonstrativeType: {value}"         |
| 必須パラメータ不足 | "Missing required parameter: {param}"                  |

## 使用例

```typescript
import { ParamsParser } from './mod.ts';

const parser = new ParamsParser();

// 基本的な使用例
const result = parser.parse(Deno.args);

// 使用例と期待される戻り値
parser.parse([]);
// { type: "no-params" }

parser.parse(['-h']);
// { type: "no-params", help: true }

parser.parse(['init']);
// { type: "single", command: "init" }

parser.parse(['to', 'issue', '--from', './input.md']);
// {
//   type: "double",
//   demonstrativeType: "to",
//   layerType: "issue",
//   options: { fromFile: "./input.md" }
// }

parser.parse(['summary', 'task', '--from', './tasks.md', '-a', 'strict']);
// {
//   type: "double",
//   demonstrativeType: "summary",
//   layerType: "task",
//   options: { fromFile: "./tasks.md", adaptation: "strict" }
// }
```

## 制約事項

1. **非対応機能**
   - パラメータの意味解釈
   - パスの検証・正規化
   - 大文字小文字の正規化（レイヤータイプのエイリアスを除く）

2. **制限事項**
   - パラメータは最大2個まで
   - エイリアスは小文字のみ
   - パス文字列の加工なし
   - オプションの重複時は最後の指定が有効
