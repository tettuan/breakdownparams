# パラメータパーサーの型定義仕様

## 概要

パラメータパーサー（`ParamsParser`）は、コマンドライン引数を解析し、型安全な結果を返すクラスです。
この仕様書では、パラメータパーサーの型定義と解析フローについて定義します。

## 型の階層構造

### 1. 基本型

```typescript
type ParamsResult = NoParamsResult | SingleParamResult | DoubleParamsResult;

// エラー情報の型
type ErrorResult = {
  message: string;
  code: string;
};
```

### 2. 各型の定義

#### 2.1 パラメータ数による型
```typescript
// 引数なし
type NoParamsResult = {
  type: 'no-params';
  help: boolean;
  version: boolean;
  error?: ErrorResult;  // パラメータエラーまたはオプションエラー時に設定
};

// 引数1個
type SingleParamResult = {
  type: 'single';
  command: 'init';
  options: OptionParams;
  error?: ErrorResult;  // パラメータエラーまたはオプションエラー時に設定
};

// 引数2個
type DoubleParamsResult = {
  type: 'double';
  demonstrativeType: DemonstrativeType;
  layerType: LayerType;
  options: OptionParams;
  error?: ErrorResult;  // パラメータエラーまたはオプションエラー時に設定
};
```

#### 2.2 オプションの型
```typescript
type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
  adaptationType?: string;
  configFile?: string;
  customVariables?: Record<string, string>;
};
```

## 解析フロー

### 1. パラメータの解析

1. **引数の数による分岐**
   ```typescript
   if (nonOptionArgs.length === 0) {
     // NoParamsResult を返す
   } else if (nonOptionArgs.length === 1) {
     // パラメータのバリデーション
     if (!isValidCommand(nonOptionArgs[0])) {
       return {
         type: 'single',
         command: 'init',
         options: {},
         error: {
           message: `Invalid command: ${nonOptionArgs[0]}`,
           code: 'INVALID_COMMAND'
         }
       };
     }
     // SingleParamResult を返す
   } else if (nonOptionArgs.length === 2) {
     // パラメータのバリデーション
     if (!isValidDemonstrativeType(nonOptionArgs[0])) {
       return {
         type: 'double',
         demonstrativeType: '...',
         layerType: '...',
         options: {},
         error: {
           message: `Invalid demonstrative type: ${nonOptionArgs[0]}`,
           code: 'INVALID_DEMONSTRATIVE_TYPE'
         }
       };
     }
     // DoubleParamsResult を返す
   }
   ```

2. **各分岐での処理**
   - パラメータのバリデーション
   - 型の決定
   - オプション解析の準備

### 2. オプションの解析

1. **オプション解析の実行**
   ```typescript
   const options = this.parseOptions(args);
   if ('error' in options) {
     // エラー時は現在のパラメータ型を維持し、error プロパティを設定
     return {
       ...currentParamResult,
       error: {
         message: options.error,
         code: 'INVALID_OPTION'
       }
     };
   }
   ```

2. **オプションの種類**
   - 標準オプション（--from, --destination など）
   - カスタム変数オプション（--uv-*）

### 3. 返却型の決定

1. **正常系**
   - パラメータの型を維持
   - オプション情報を追加

2. **エラー系**
   - パラメータの型を維持
   - エラー情報を error プロパティとして追加

## オプションエラー時の返却型

### 1. 返却型の決定

パラメータまたはオプションでエラーが発生した場合、パラメータの型を維持したまま、error プロパティにエラー情報を設定します：

```typescript
// 例：パラメータエラーの場合
{
  type: 'double',
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
  type: 'double',
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
  type: 'single',
  command: 'init',
  options: {},
  error: {
    message: 'Invalid command: invalid-command',
    code: 'INVALID_COMMAND'
  }
}

// 例2: パラメータエラー（不正なレイヤータイプ）
{
  type: 'double',
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
  type: 'single',
  command: 'init',
  options: {},
  error: {
    message: 'Invalid custom variable name: invalid@name',
    code: 'INVALID_CUSTOM_VARIABLE'
  }
}
```

### 3. 型の一貫性

- パラメータの型（NoParamsResult, SingleParamResult, DoubleParamsResult）を維持
- エラー情報は各パラメータ型の error プロパティとして保持
- 型の変換は行わない

## 使用例

```typescript
const parser = new ParamsParser();
const result = parser.parse(args);

if (result.type === 'no-params') {
  if (result.error) {
    // エラー処理
    console.error(`Error ${result.error.code}: ${result.error.message}`);
  } else {
    // 正常処理
  }
} else if (result.type === 'single') {
  if (result.error) {
    // エラー処理
    console.error(`Error ${result.error.code}: ${result.error.message}`);
  } else {
    // 正常処理
  }
} else if (result.type === 'double') {
  if (result.error) {
    // エラー処理
    console.error(`Error ${result.error.code}: ${result.error.message}`);
  } else {
    // 正常処理
  }
}
```

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