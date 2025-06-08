# パラメータパーサー

このディレクトリには、コマンドライン引数の解析を担当するパラメータパーサーの実装が含まれています。

## 主要な責務

`params_parser.ts` は以下の責務を持ちます：

1. **コマンドライン引数の解析**
   - 位置引数（パラメータ）の解析
   - オプション引数の解析
   - 引数の型安全性の保証

2. **パラメータの分類**
   - ZeroParams: 位置引数なし（オプションのみ）
   - OneParam: 1つの位置引数（`init` コマンド）
   - TwoParams: 2つの位置引数（`<demonstrativeType> <layerType>`）

3. **バリデーション**
   - パラメータ数の制約チェック
   - DemonstrativeType の有効性チェック
   - LayerType の有効性チェック
   - オプションの有効性チェック

4. **エラー処理**
   - パラメータエラーの検出と報告
   - オプションエラーの検出と報告
   - 型安全なエラー情報の提供

## 型定義

パーサーは以下の型定義に基づいて動作します：

```typescript
type ParamsResult = ZeroParamsResult | OneParamResult | TwoParamsResult;
```

各型の詳細な定義は `docs/params_type.md` を参照してください。

## 使用例

```typescript
const parser = new ParamsParser();
const result = parser.parse(args);

if (result.type === 'zero-params') {
  // オプションのみの処理
} else if (result.type === 'one') {
  // init コマンドの処理
} else if (result.type === 'two') {
  // demonstrativeType と layerType の処理
}
```

## 詳細な仕様

このパーサーの詳細な仕様については、以下のドキュメントを参照してください：

- [パラメータ仕様](docs/params.md)
- [パラメータパーサー型定義仕様](docs/params_type.md)
- [オプション仕様](docs/options.md)

## テスト

パーサーのテストは以下の3つのレベルで実装されています：

1. `0_architecture_params_parser_test.ts` - アーキテクチャテスト
   - インターフェースの契約テスト
   - エラー処理の契約テスト

2. `1_structure_params_parser_test.ts` - 構造テスト
   - データ構造の検証
   - 型の整合性テスト

3. `2_unit_params_parser_test.ts` - ユニットテスト
   - 機能テスト
   - 振る舞いテスト

## 注意事項

- このパーサーは型安全性を重視して設計されています
- エラー情報は型安全な方法で提供されます
- パラメータの型は一貫性を保ちます 