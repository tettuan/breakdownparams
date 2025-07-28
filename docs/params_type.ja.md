# パラメータ型の定義

## 基本型

```typescript
type ParamsResult = ZeroParamsResult | OneParamsResult | TwoParamsResult | ErrorResult;

type ZeroParamsResult = {
  type: 'zero';
  options: OptionParams;
};

type OneParamsResult = {
  type: 'one';
  directiveType: string;
};

type TwoParamsResult = {
  type: 'two';
  directiveType: string;
  layerType: string;
  options: OptionParams;
  userVariables?: UserVariables;
};

type ErrorResult = {
  type: 'error';
  error: ErrorInfo;
};

type ErrorInfo = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};

type OptionParams = {
  help?: boolean;
  version?: boolean;
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: string;
  adaptationType?: string;
  configFile?: string;
};

type UserVariables = {
  [key: `uv-${string}`]: string;
};
```

## 使用例

```typescript
// ZeroParamsResult を返す
const zeroResult: ZeroParamsResult = {
  type: 'zero',
  options: {
    help: true
  }
};

// OneParamsResult を返す
const oneResult: OneParamsResult = {
  type: 'one',
  directiveType: 'init'
};

// TwoParamsResult を返す
const twoResult: TwoParamsResult = {
  type: 'two',
  directiveType: 'to',
  layerType: 'project',
  options: {
    fromFile: 'input.json',
    destinationFile: 'output.json'
  },
  userVariables: {
    'uv-project': 'myproject',
    'uv-version': '1.0.0'
  }
};

// ErrorResult を返す
const errorResult: ErrorResult = {
  type: 'error',
  error: {
    message: 'Invalid directive type: invalid-type',
    code: 'INVALID_DIRECTIVE_TYPE',
    details: {
      value: 'invalid-type',
      expected: 'to, summary, or defect'
    }
  }
};
```

## 型の特徴

1. パラメータパターンに基づく型定義
   - `ZeroParamsResult`: パラメータなし（オプションのみ）
   - `OneParamsResult`: 単一パラメータ（init コマンド）
   - `TwoParamsResult`: 二重パラメータ（メインアプリケーション実行）
   - `ErrorResult`: エラー結果

2. 型安全性の確保
   - 各パターンに応じた必須プロパティ
   - オプショナルなプロパティの明確な定義
   - エラー情報の統一的な扱い

3. 拡張性の考慮
   - 明確に区別された結果型
   - 新しいパターンの追加が容易
   - 既存の型との互換性を保持

## 各型の詳細

### ZeroParamsResult

パラメータなしで実行された場合の結果型。オプションのみが指定可能。

- `type`: 常に `'zero'`
- `options`: 指定されたオプション（help、version など）

### OneParamsResult

単一パラメータで実行された場合の結果型。現在は `init` コマンドのみサポート。

- `type`: 常に `'one'`
- `directiveType`: 指定されたコマンド（通常は `'init'`）

**注意**: OneParamsResult ではオプションは無視されます。

### TwoParamsResult

二重パラメータで実行された場合の結果型。メインアプリケーションの実行で使用。

- `type`: 常に `'two'`
- `directiveType`: 最初のパラメータ（例: `'to'`, `'summary'`, `'defect'`）
- `layerType`: 二番目のパラメータ（例: `'project'`, `'issue'`, `'task'`）
- `options`: 指定されたオプション
- `userVariables`: ユーザー変数オプション（`--uv-*` 形式）

### ErrorResult

エラーが発生した場合の結果型。

- `type`: 常に `'error'`
- `error`: エラー情報
  - `message`: エラーメッセージ
  - `code`: エラーコード
  - `details`: 追加のエラー詳細（オプショナル）

## オプションの正規化

すべてのオプションは正規化された形式で返されます：

- ロングオプション: `--help` → `help: true`
- ショートオプション: `-h` → `help: true`
- 値付きオプション: `--from=file.txt` → `fromFile: 'file.txt'`
- ユーザー変数: `--uv-config=value` → `userVariables: { 'uv-config': 'value' }`

## エラーコード

主なエラーコード：

- `INVALID_DIRECTIVE_TYPE`: 不正な directiveType
- `INVALID_LAYER_TYPE`: 不正な layerType
- `INVALID_OPTION`: 不正なオプション
- `INVALID_USER_VARIABLE`: 不正なユーザー変数
- `TOO_MANY_ARGUMENTS`: 引数が多すぎる
- `INVALID_COMMAND`: 不正なコマンド

## 注意事項

1. **型の判別**
   - `type` フィールドを使用して結果型を判別
   - TypeScript の型ガード機能を活用

2. **エラーハンドリング**
   - すべてのエラーは `ErrorResult` として返される
   - エラーの詳細は `error.details` で確認可能

3. **オプションの扱い**
   - OneParamsResult ではオプションは無視される
   - TwoParamsResult でのみすべてのオプションが有効

---

[日本語版](params_type.ja.md) | [English Version](params_type.md)