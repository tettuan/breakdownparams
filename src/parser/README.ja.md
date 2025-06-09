# パラメータパーサー

このディレクトリには、コマンドライン引数の解析を担当するパラメータパーサーの実装が含まれています。

## オプションクラス中心設計による簡素化

新しい設計では、ParamsParserはオプションの正規化処理をOptionクラスに委譲し、よりシンプルな構造になりました：

- **OptionFactoryの活用**: コマンドライン引数からOptionインスタンスを生成
- **正規化の委譲**: 各Optionインスタンスが自身の正規化を担当
- **バリデーションの統合**: Optionインスタンスから直接バリデーション結果を取得

## 主要な責務

`params_parser.ts` は以下の簡素化された責務を持ちます：

1. **Optionインスタンスの作成**
   - OptionFactoryを使用してコマンドライン引数からOptionインスタンスを生成
   - 正規化処理はOptionクラスに委譲

2. **パラメータの分類**
   - ZeroParams: 位置引数なし（オプションのみ）
   - OneParam: 1つの位置引数（`init` コマンド）
   - TwoParams: 2つの位置引数（`<demonstrativeType> <layerType>`）

3. **バリデーションの統合**
   - Optionインスタンスからバリデーション結果を取得
   - パラメータ数の制約チェック
   - DemonstrativeType と LayerType の有効性チェック

4. **統一された結果返却**
   - パラメータエラーとオプションエラーの統合
   - 型安全な結果情報の提供

## 型定義

パーサーは以下の型定義に基づいて動作します：

```typescript
type ParamsResult = ZeroParamsResult | OneParamsResult | TwoParamsResult;
```

各型の詳細な定義は `docs/params_type.md` を参照してください。

## 使用例

```typescript
const parser = new ParamsParser();
const result = parser.parse(['to', 'project', '--uv-name=test']);

if (result.type === 'break') {
  console.log(result.demonstrativeType); // 'to'
  console.log(result.layerType); // 'project'
  console.log(result.options['uv-name']); // 'test' (正規化後: uv-name)
}
```

## 新しい実装フロー

```typescript
class ParamsParser {
  private optionFactory: OptionFactory;

  public parse(args: string[]): ParamsResult {
    // 1. OptionFactoryでOptionインスタンスを生成
    const options = this.optionFactory.createOptions(args);
    
    // 2. Optionインスタンスから正規化された値を取得
    const normalizedArgs = this.extractNormalizedArgs(options);
    
    // 3. パラメータ検証
    const results = this.validators.map(v => v.validate(normalizedArgs));
    
    // 4. オプション検証（Optionインスタンスから直接）
    const optionResults = this.validateOptions(options);
    
    return this.determineResult(results, optionResults);
  }
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