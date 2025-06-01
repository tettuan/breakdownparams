# パラメータバリデーション仕様

このドキュメントは、breakdownparamsライブラリのパラメータバリデーション機能の仕様を定義します。

## 1. 概要

パラメータバリデーション機能は、DemonstrativeTypeとLayerTypeの値を正規表現パターンで検証する機能です。
デフォルトの設定値を使用することで、標準的な使用パターンをサポートしつつ、必要に応じてカスタムなバリデーションルールを適用することができます。

## 2. バリデーションの範囲

### 2.1 バリデーション対象

1. **DemonstrativeType**
   - デフォルトパターン：`^(to|summary|defect)$`
   - カスタムパターン：設定値で指定

2. **LayerType**
   - デフォルトパターン：`^(project|issue|task)$`
   - カスタムパターン：設定値で指定

### 2.2 非バリデーション対象

以下の機能はバリデーションの対象外です：

- パラメータの解析処理
- オプションの処理
- 戻り値の型
- エラー処理の基本構造

## 3. 設定値

### 3.1 設定値の構造

```typescript
interface ParserConfig {
  // DemonstrativeTypeの設定
  demonstrativeType: {
    // 許可する値のパターン（正規表現）
    pattern: string;
    // カスタムエラーメッセージ
    errorMessage?: string;
  };

  // LayerTypeの設定
  layerType: {
    // 許可する値のパターン（正規表現）
    pattern: string;
    // カスタムエラーメッセージ
    errorMessage?: string;
  };
}
```

### 3.2 デフォルト設定値

```typescript
const DEFAULT_CONFIG: ParserConfig = {
  demonstrativeType: {
    pattern: '^(to|summary|defect)$',
    errorMessage: 'Invalid demonstrative type. Must be one of: to, summary, defect'
  },
  layerType: {
    pattern: '^(project|issue|task)$',
    errorMessage: 'Invalid layer type. Must be one of: project, issue, task'
  }
};
```

### 3.3 カスタム設定値の例

```typescript
// カスタム設定値の例
const customConfig: ParserConfig = {
  demonstrativeType: {
    pattern: '^[a-z]+$',  // 小文字のアルファベットのみ許可
    errorMessage: 'Invalid demonstrative type',
  },
  layerType: {
    pattern: '^[a-z]+$',  // 小文字のアルファベットのみ許可
    errorMessage: 'Invalid layer type',
  },
};
```

## 4. バリデーション処理

### 4.1 デフォルト設定値でのバリデーション

デフォルト設定値では、以下の値のみを許可します：

- DemonstrativeType: `to`, `summary`, `defect`
- LayerType: `project`, `issue`, `task`

### 4.2 カスタム設定値でのバリデーション

カスタム設定値では、設定値で指定されたパターンに一致する値を許可します：

1. **DemonstrativeTypeのバリデーション**
   - 設定値のパターンに一致するかチェック
   - 不一致の場合はカスタムエラーメッセージを返却

2. **LayerTypeのバリデーション**
   - 設定値のパターンに一致するかチェック
   - 不一致の場合はカスタムエラーメッセージを返却

## 5. 使用例

### 5.1 パーサーの初期化

```typescript
import { ParamsParser } from './mod.ts';

// デフォルト設定値でパーサーを初期化
const parser = new ParamsParser();

// カスタム設定値でパーサーを初期化
const customParser = new ParamsParser(customConfig);
```

### 5.2 パラメータの解析

```typescript
// デフォルト設定値での使用例
const result = parser.parse(['to', 'project']);

if (result.type === 'break') {
  console.log(result.demonstrativeType); // "to"
  console.log(result.layerType); // "project"
}

// カスタム設定値での使用例
const customResult = customParser.parse(['custom', 'layer']);

if (customResult.type === 'break') {
  console.log(customResult.demonstrativeType); // "custom"
  console.log(customResult.layerType); // "layer"
}
```

## 6. エラー処理

### 6.1 エラーの種類

1. **バリデーションエラー**
   - パターン不一致
   - カスタムエラーメッセージを返却

2. **設定エラー**
   - 不正な設定値
   - パターンの構文エラー

### 6.2 エラーメッセージ

```typescript
// バリデーションエラーの例
{
  type: "break",
  error: {
    message: "Invalid demonstrative type. Must be one of: to, summary, defect",
    code: "INVALID_DEMONSTRATIVE_TYPE"
  }
}

// 設定エラーの例
{
  type: "break",
  error: {
    message: "Invalid configuration: pattern is required",
    code: "INVALID_CONFIGURATION"
  }
}
```

## 7. 制約事項

1. **パターンの制約**
   - 正規表現として有効である必要がある
   - 複雑すぎるパターンは避ける

2. **パフォーマンス**
   - パターンは事前にコンパイルする
   - 複雑なパターンは実行時オーバーヘッド

3. **セキュリティ**
   - パターンは適切に制限する
   - ユーザー入力の直接使用は避ける

## 8. 移行ガイド

### 8.1 デフォルト設定値からカスタム設定値への移行

1. 設定値の準備
   - 必要なパターンの定義
   - エラーメッセージの準備

2. パーサーの初期化
   - カスタム設定値の適用

3. 既存コードの確認
   - エラーハンドリングの確認
   - 戻り値の型の確認

### 8.2 カスタム設定値からデフォルト設定値への移行

1. デフォルト設定値の使用
   - カスタム設定値の削除
   - デフォルト設定値の適用

2. パラメータの確認
   - デフォルト値の使用確認
   - カスタム値の置き換え

---

[日本語版](custom_params.ja.md) | [English Version](custom_params.md)
