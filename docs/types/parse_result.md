# ParseResult と ParamPatternResult の違い

## 概要

`ParseResult`と`ParamPatternResult`は、パラメータ解析の結果を表す型ですが、それぞれ異なる役割を持っています。

## ParamPatternResult

`ParamPatternResult`は、パラメータ解析の基本となる型で、以下の3つの型のユニオン型として定義されています：

```typescript
type ParamPatternResult =
  | ZeroParamResult
  | OneParamResult
  | TwoParamResult;
```

各型の特徴：

1. `ZeroParamResult`
   - パラメータなしのコマンド（help/version）用
   - シンプルな構造で、help/versionフラグを持つ

2. `OneParamResult`
   - 単一パラメータのコマンド（layer）用
   - コマンド名とオプションを持つ

3. `TwoParamResult`
   - 二重パラメータのコマンド（break）用
   - 2つのパラメータとオプションを持つ

## ParseResult

`ParseResult`は、`ParamPatternResult`を拡張した型で、ジェネリック型として定義されています：

```typescript
type ParseResult<T extends ParamPatternResult> = T & {
  error?: ErrorInfo;
};
```

特徴：
- `ParamPatternResult`の任意の型を`T`として受け取り、その型に`error`プロパティを追加
- パース処理の結果を表現するために使用

## 使い分け

- `ParamPatternResult`: 基本的な解析結果の型として使用
- `ParseResult`: パース処理の結果を表現するために使用

## 関係性

- `ParamPatternResult`: 具体的な解析結果の型を定義
- `ParseResult`: ジェネリック型を使用して、任意の`ParamPatternResult`型を拡張可能

## 使用例

```typescript
// ParamPatternResultの使用例
const zeroParamResult: ZeroParamResult = {
  type: 'help',
  help: true
};

// ParseResultの使用例
const parseResult: ParseResult<ZeroParamResult> = {
  type: 'help',
  help: true,
  error: {
    message: 'Invalid option',
    code: 'INVALID_OPTION'
  }
};
```

## まとめ

- `ParamPatternResult`は基本的な解析結果の型を定義
- `ParseResult`は`ParamPatternResult`を拡張してエラー情報を含む型を提供 