# ParamsResult モジュール

このモジュールは、パラメータ解析の結果を型安全に扱うためのインターフェースを提供します。

> 注意: このドキュメントは概要のみを提供します。詳細な仕様については `docs/` ディレクトリ内の各ドキュメントを参照してください。

## 概要

`ParamsResult` は、コマンドライン引数の解析結果を表す基本インターフェースです。パラメータの数に基づいて3つの型に分類されます：

1. **ZeroParamsResult**
   - パラメータなし（help/versionコマンド用）
   - オプションのみ指定可能

2. **OneParamResult**
   - 単一パラメータ（initコマンド用）
   - コマンド名とオプションを持つ

3. **TwoParamResult**
   - 二重パラメータ（メイン機能用）
   - DemonstrativeTypeとLayerTypeの組み合わせ
   - オプションを持つ

## 型定義

```typescript
interface ParamsResult {
  isValid: boolean;
  error?: string;
  options: OptionParams;
}

interface ZeroParamsResult extends ParamsResult {
  type: "zero";
}

interface OneParamResult extends ParamsResult {
  type: "one";
  param: string;
}

interface TwoParamResult extends ParamsResult {
  type: "two";
  demonstrativeType: string;
  layerType: string;
}
```

## 特徴

1. **型安全性**
   - 各パターンに応じた必須プロパティ
   - オプショナルなプロパティの明確な定義
   - エラー情報の統一的な扱い

2. **エラーハンドリング**
   - 各パラメータ型は `error` プロパティを持つ
   - エラー情報は型を維持したまま保持
   - デバッグフレンドリーな設計

3. **拡張性**
   - パラメータの型を維持
   - 新しいパターンの追加が容易
   - 既存の型との互換性を保持

## 使用例

```typescript
// ZeroParamsResult の例
const helpResult: ZeroParamsResult = {
  type: "zero",
  isValid: true,
  options: {}
};

// OneParamResult の例
const initResult: OneParamResult = {
  type: "one",
  isValid: true,
  param: "init",
  options: {
    fromFile: "input.json"
  }
};

// TwoParamResult の例
const toResult: TwoParamResult = {
  type: "two",
  isValid: true,
  demonstrativeType: "to",
  layerType: "project",
  options: {
    fromFile: "input.json",
    destinationFile: "output.json"
  }
};
```

## 関連ドキュメント

- [パラメータ型の定義](docs/params_type.ja.md)
- [パラメータの仕様](docs/params.ja.md)
- [アーキテクチャ概要](docs/architecture/layer1_overview.ja.md)
- [用語集](docs/glossary.ja.md) 