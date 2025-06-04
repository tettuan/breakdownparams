# パラメータ型の定義

## 基本型

```typescript
type ParamPatternResult = ZeroParamResult | OneParamResult | TwoParamResult;

type ZeroParamResult = {
  type: 'help' | 'version';
  help?: boolean;
  version?: boolean;
  error?: ErrorInfo;
};

type OneParamResult = {
  type: 'layer';
  command: string;
  options: OptionParams;
  error?: ErrorInfo;
};

type TwoParamResult = {
  type: 'break';
  demonstrativeType: string;
  layerType: string;
  options: OptionParams;
  error?: ErrorInfo;
};
```

## 使用例

```typescript
// ZeroParamResult を返す
const helpResult: ZeroParamResult = {
  type: 'help',
  help: true
};

// OneParamResult を返す
const layerResult: OneParamResult = {
  type: 'layer',
  command: 'create',
  options: {
    fromFile: 'input.json'
  }
};

// TwoParamResult を返す
const breakResult: TwoParamResult = {
  type: 'break',
  demonstrativeType: 'type1',
  layerType: 'layer1',
  options: {
    fromFile: 'input.json',
    destinationFile: 'output.json'
  }
};
```

## 型の特徴

1. パラメータパターンに基づく型定義
   - `ZeroParamResult`: パラメータなし（help/version）
   - `OneParamResult`: 単一パラメータ（layer command）
   - `TwoParamResult`: 二重パラメータ（break command）

2. 型安全性の確保
   - 各パターンに応じた必須プロパティ
   - オプショナルなプロパティの明確な定義
   - エラー情報の統一的な扱い

3. 拡張性の考慮
   - パラメータの型（ZeroParamResult, OneParamResult, TwoParamResult）を維持
   - 新しいパターンの追加が容易
   - 既存の型との互換性を保持

## オプションエラー時の返却型

### 1. 返却型の決定

パラメータまたはオプションでエラーが発生した場合、パラメータの型を維持したまま、error プロパティにエラー情報を設定します：

```typescript
// 例：パラメータエラーの場合
{
  type: 'two',
  demonstrativeType: '...',
  layerType: '...',
  options: {},
  error: {
    message: 'Invalid demonstrative type: invalid-type',
    code: 'INVALID_DEMONSTRATIVE_TYPE'
  }
}

// 例：オプションエラーの場合
{
  type: 'two',
  demonstrativeType: '...',
  layerType: '...',
  options: {},
  error: {
    message: 'Invalid option: --invalid-option',
    code: 'INVALID_OPTION'
  }
}
```

### 2. 返却型の例

```typescript
// 例1: パラメータエラー（不正なコマンド）
{
  type: 'one',
  command: 'init',
  options: {},
  error: {
    message: 'Invalid command: invalid-command',
    code: 'INVALID_COMMAND'
  }
}

// 例2: パラメータエラー（不正なレイヤータイプ）
{
  type: 'two',
  demonstrativeType: '...',
  layerType: '...',
  options: {},
  error: {
    message: 'Invalid layer type: invalid-layer',
    code: 'INVALID_LAYER_TYPE'
  }
}

// 例3: オプションエラー（カスタム変数の命名規則違反）
{
  type: 'one',
  command: 'init',
  options: {},
  error: {
    message: 'Invalid custom variable name: invalid@name',
    code: 'INVALID_CUSTOM_VARIABLE'
  }
}
```

### 3. 型の一貫性

- パラメータの型（ZeroParamsResult, OneParamResult, TwoParamsResult）を維持
- エラー情報は各パラメータ型の error プロパティとして保持
- 型の変換は行わない

## 注意事項

1. **型の一貫性**
   - 各分岐内での型の一貫性を保つ
   - 型の変換は最小限に抑える

2. **エラーハンドリング**
   - エラーは各パラメータ型内で処理
   - エラー時も型の一貫性を保つ

3. **型チェック**
   - 実行時の型チェックを確実に行う
   - 型の不一致を防ぐ

---

[日本語版](params_type.ja.md) | [English Version](params_type.md) 