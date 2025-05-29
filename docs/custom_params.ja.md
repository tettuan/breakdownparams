# パラメータ拡張仕様

このドキュメントは、breakdownparamsライブラリのパラメータ拡張機能の仕様を定義します。

## 1. 概要

パラメータ拡張機能は、標準のDemonstrativeTypeとLayerTypeのバリデーションルールを拡張する機能です。
拡張モードでは、標準のバリデーションルールに加えて、カスタムなバリデーションルールを適用することができます。

## 2. 拡張機能の範囲

### 2.1 拡張対象

1. **DemonstrativeType**
   - 標準値：`to`, `summary`, `defect`
   - 拡張可能な値：設定値で指定

2. **LayerType**
   - 標準値：`project`, `issue`, `task`
   - 拡張可能な値：設定値で指定

### 2.2 非拡張対象

以下の機能は拡張の対象外です：

- パラメータの解析処理
- オプションの処理
- 戻り値の型
- エラー処理の基本構造

## 3. 設定値

### 3.1 設定値の構造

```typescript
interface ParserConfig {
  // 拡張モードの有効/無効
  isExtendedMode: boolean;

  // DemonstrativeTypeの拡張設定
  demonstrativeType?: {
    // 許可する値のパターン（正規表現）
    pattern: string;
    // カスタムエラーメッセージ
    errorMessage?: string;
  };

  // LayerTypeの拡張設定
  layerType?: {
    // 許可する値のパターン（正規表現）
    pattern: string;
    // カスタムエラーメッセージ
    errorMessage?: string;
  };
}
```

### 3.2 設定値の例

```typescript
// 拡張モードの設定例
const config: ParserConfig = {
  isExtendedMode: true,
  demonstrativeType: {
    pattern: '^[a-z]+$',
    errorMessage: 'Invalid demonstrative type',
  },
  layerType: {
    pattern: '^[a-z]+$',
    errorMessage: 'Invalid layer type',
  },
};
```

## 4. バリデーション処理

### 4.1 標準モード

標準モードでは、以下の値のみを許可します：

- DemonstrativeType: `to`, `summary`, `defect`
- LayerType: `project`, `issue`, `task`

### 4.2 拡張モード

拡張モードでは、設定値で指定されたパターンに一致する値を許可します：

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

// 拡張モードでパーサーを初期化
const config: ParserConfig = {
  isExtendedMode: true,
  demonstrativeType: {
    pattern: '^[a-z]+$',
  },
  layerType: {
    pattern: '^[a-z]+$',
  },
};

const parser = new ParamsParser(config);
```

### 5.2 パラメータの解析

```typescript
// 標準モードと同様の使用方法
const result = parser.parse(['custom', 'layer']);

if (result.type === 'one') {
  console.log(result.demonstrativeType); // "custom"
  console.log(result.layerType); // "layer"
}
```

## 6. エラー処理

### 6.1 エラーの種類

1. **バリデーションエラー**
   - パターン不一致
   - カスタムエラーメッセージを返却

2. **設定エラー**
   - 不正な設定値
   - 拡張モードが無効な場合の拡張設定

### 6.2 エラーメッセージ

```typescript
// バリデーションエラーの例
{
  type: "one",
  error: {
    message: "Invalid demonstrative type: custom",
    code: "INVALID_DEMONSTRATIVE_TYPE"
  }
}

// 設定エラーの例
{
  type: "one",
  error: {
    message: "Invalid configuration: pattern is required in extended mode",
    code: "INVALID_CONFIGURATION"
  }
}
```

各型の詳細な定義と使用方法については、[パラメータパーサーの型定義仕様](params_type.ja.md)を参照してください。

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

### 8.1 標準モードから拡張モードへの移行

1. 設定値の準備
   - 必要なパターンの定義
   - エラーメッセージの準備

2. パーサーの初期化
   - 拡張モードの有効化
   - 設定値の適用

3. 既存コードの確認
   - エラーハンドリングの確認
   - 戻り値の型の確認

### 8.2 拡張モードから標準モードへの移行

1. 設定値の無効化
   - `isExtendedMode: false` の設定
   - 拡張設定の削除

2. パラメータの確認
   - 標準値の使用確認
   - カスタム値の置き換え

---

[日本語版](custom_params.ja.md) | [English Version](custom_params.md)
