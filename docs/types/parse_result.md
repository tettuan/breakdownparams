# ParseResult と ParamsResult の違い

## 概要

`ParseResult`と`ParamsResult`は、パラメータ解析の結果を表す型ですが、それぞれ異なる役割を持っています。

## ParamsResult

`ParamsResult`は、パラメータ解析の基本となる型で、以下の3つの型のユニオン型として定義されています：

```typescript
type ParamsResult =
  | NoParamsResult
  | SingleParamResult
  | DoubleParamsResult;
```

各型の特徴：

1. `NoParamsResult`
   - パラメータなしのコマンドまたはヘルプ/バージョンフラグ用
   - `type: 'no-params'`
   - `help: boolean`
   - `version: boolean`
   - `error?: ErrorInfo`

2. `SingleParamResult`
   - 単一パラメータのコマンド用（例：'init'）
   - `type: 'single'`
   - `command: 'init'`
   - `options: OptionParams`
   - `error?: ErrorInfo`

3. `DoubleParamsResult`
   - 指示タイプとレイヤータイプを持つコマンド用
   - `type: 'double'`
   - `demonstrativeType: DemonstrativeType`
   - `layerType: LayerType`
   - `options: OptionParams`
   - `error?: ErrorInfo`

## ParseResult

`ParseResult`は、`ParamsResult`を拡張した型で、ジェネリック型として定義されています：

```typescript
type ParseResult<T extends ParamsResult> = T & {
  error?: ErrorResult;
};
```

特徴：
- `ParamsResult`の任意の型を`T`として受け取り、その型に`error`プロパティを追加
- エラー情報を含む可能性のある解析結果を表す
- 型安全性を保ちながら、エラー情報を追加できる

## 主な違い

1. **型の役割**
   - `ParamsResult`: パラメータ解析の基本となる型の集合
   - `ParseResult`: エラー情報を含む可能性のある解析結果を表す拡張型

2. **使用箇所**
   - `ParamsResult`: 基本的な解析結果の型として使用
   - `ParseResult`: エラー処理を含む解析結果の型として使用

3. **型の柔軟性**
   - `ParamsResult`: 具体的な解析結果の型を定義
   - `ParseResult`: ジェネリック型を使用して、任意の`ParamsResult`型を拡張可能

## 使用例

```typescript
// ParamsResultの使用例
const noParamsResult: NoParamsResult = {
  type: 'no-params',
  help: true,
  version: false
};

// ParseResultの使用例
const parseResult: ParseResult<NoParamsResult> = {
  type: 'no-params',
  help: true,
  version: false,
  error: {
    message: 'Invalid command',
    code: ErrorCode.INVALID_COMMAND,
    category: ErrorCategory.VALIDATION
  }
};
```

## まとめ

- `ParamsResult`は基本的な解析結果の型を定義
- `ParseResult`は`ParamsResult`を拡張してエラー情報を含む型を提供
- 両方の型を使用することで、型安全なパラメータ解析とエラー処理が可能 