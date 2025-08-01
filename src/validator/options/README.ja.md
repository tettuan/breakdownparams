# options ディレクトリ サブモジュール概要

このディレクトリは、コマンドラインオプションのバリデーションに関する主要なロジックを提供します。

## オプションクラス中心設計による変更

新しい設計では、バリデータは正規化処理を行わなくなりました：

- **正規化の削除**: オプションの正規化はOptionクラスが担当
- **バリデーションの純粋化**: バリデータは検証ロジックのみに集中
- **Optionインスタンスの活用**: 正規化されたOptionインスタンスから値を取得

> **メインの詳細ドキュメントは `docs/` 配下にあります。ここは概要・導入ガイドです。**

---

## ファイル構成と役割

### option_combination_rule.ts

- **役割**: オプションの組み合わせルール（どのオプションが許可され、必須か、依存関係は何か）を定義します。
- **主なエクスポート**:
  - `OptionCombinationRule` インターフェース: allowedOptions, requiredOptions, combinationRules などの構造を持つ
  - `DEFAULT_OPTION_COMBINATION_RULES`: zero/one/two 各パラメータタイプごとのデフォルトルール
- **参考**: [docs/validation.ja.md](../../docs/validation.ja.md), [docs/options.md](../../docs/options.md)

### option_combination_validator.ts

- **役割**: OptionCombinationRule に基づき、与えられたオプションの組み合わせが正しいか検証します。
- **主なエクスポート**:
  - `OptionCombinationValidator` クラス: validate(options: Record<string, unknown>): OptionCombinationResult
  - `OptionCombinationResult` インターフェース: isValid, errorMessage, errorCode など
- **特徴**:
  - 入力はOptionインスタンスから取得した正規化済みの値（`help`, `uv-config` など）
  - オプションの組み合わせルールのみを検証（カスタム変数の検証は `UserVariableValidator` の責務）
  - 標準オプションの組み合わせ、必須オプションの存在、オプション間の依存関係を検証
- **参考**: [docs/architecture/layer2_diagrams.ja.md](../../docs/architecture/layer2_diagrams.ja.md), [docs/validation.ja.md](../../docs/validation.ja.md)

### option_validator.ts

- **役割**: パラメータタイプごと（zero/one/two）の個別オプションバリデータを提供します。
- **主なエクスポート**:
  - `ZeroOptionValidator`, `OneOptionValidator`, `TwoOptionValidator` クラス
  - `OptionValidator` インターフェース
- **特徴**:
  - 許可オプション・ユーザー変数許可可否・型チェック・エラー生成ロジックを内包
  - Optionインスタンスから検証結果を取得し、統合的な検証を実施
- **参考**: [docs/validation.ja.md](../../docs/validation.ja.md), [docs/options.md](../../docs/options.md)

---

### user_variable_validator.ts

- **役割**: ユーザー変数オプションの検証ロジックを提供します。
- **主なエクスポート**:
  - `UserVariableValidator` クラス
- **特徴**:
  - ユーザー変数名の形式検証（`uv-` プレフィックス）
  - 変数名の文字列パターン検証
  - Optionインスタンスの検証結果を使用

## 関連仕様・詳細ドキュメント

- [docs/options.md](../../docs/options.md): オプション仕様・フォーマット・制約
- [docs/validation.ja.md](../../docs/validation.ja.md): バリデーション仕様・エラー定義
- [docs/user_variable_options.md](../../docs/user_variable_options.md): ユーザー変数オプション仕様
- [docs/architecture/layer2_diagrams.ja.md](../../docs/architecture/layer2_diagrams.ja.md): バリデーション・オプション検証のシーケンス/クラス図
- [docs/architecture/layer5_implementation.ja.md](../../docs/architecture/layer5_implementation.ja.md): 実装詳細

---

## 注意事項

- 本ディレクトリの各ファイルは「docs/」配下のドキュメントを参照しながら設計・実装されています。
- 詳細な仕様や拡張ルール、エラーケース、利用例は必ず docs/ を参照してください。
