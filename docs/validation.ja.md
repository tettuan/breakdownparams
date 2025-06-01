# バリデーション仕様

このドキュメントは、breakdownparamsライブラリのバリデーション機能の仕様を定義します。

## 1. バリデータの構造

```yaml
# パーサーとバリデータの依存関係

ParamsParser:
  - BaseValidator:
      - バリデータの基底クラス
      - エラーコードとカテゴリの管理
  - SecurityErrorValidator:
      - コマンドインジェクションの検出
      - セキュリティチェック
  - OptionsValidator:
      - オプション形式の一元化された検証
      - すべてのパーサーで共通のオプション検証ロジックを提供
      - オプションの正規化と標準化
      - オプション値の型チェック
      - 必須オプションの検証
      - オプション間の依存関係チェック
  - DemonstrativeTypeValidator:
      - demonstrative type の検証
      - 正規表現パターンによる値の検証
      - デフォルトパターン: ^(to|summary|defect)$
  - LayerTypeValidator:
      - layer type の検証
      - 正規表現パターンによる値の検証
      - デフォルトパターン: ^(project|issue|task)$
  - ZeroParamValidator:
      - コマンドなしの引数パターンを検証
      - --help, --version フラグの処理
  - OneParamValidator:
      - 単一パラメータの検証
      - init コマンドの処理
  - TwoParamValidator:
      - 2つのパラメータの検証
      - demonstrative type と layer type の検証
      - カスタム変数オプションの検証

# バリデーション設定

ParserConfig:
  demonstrativeType:
    pattern: string  # 正規表現パターン
    errorMessage?: string  # カスタムエラーメッセージ
  layerType:
    pattern: string  # 正規表現パターン
    errorMessage?: string  # カスタムエラーメッセージ

# デフォルト設定値

DEFAULT_CONFIG:
  demonstrativeType:
    pattern: "^(to|summary|defect)$"
    errorMessage: "Invalid demonstrative type. Must be one of: to, summary, defect"
  layerType:
    pattern: "^(project|issue|task)$"
    errorMessage: "Invalid layer type. Must be one of: project, issue, task"

# オプション処理の統一

options:
  format: "--key=value"  # イコール区切りのみ許可
  short_format: "-k=value"  # ショートオプションもイコール区切り
  special_cases:
    - "-c=value" -> "configFile"
    - "--config=value" -> "configFile"
  validation:
    - カスタム変数: "--uv-*" 形式のみ許可
    - オプション値: 空文字列は許可しない
    - 未知のオプション: エラーとして処理
    - オプションの重複: エラーとして処理
    - 必須オプションの欠落: エラーとして処理
    - オプション値の型チェック: 文字列、数値、真偽値など

# エラー定義

errors:
  validation:
    - code: "INVALID_DEMONSTRATIVE_TYPE"
      message: "Invalid demonstrative type. Must be one of: to, summary, defect"
    - code: "INVALID_LAYER_TYPE"
      message: "Invalid layer type. Must be one of: project, issue, task"
    - code: "INVALID_OPTION_FORMAT"
      message: "Invalid option format. Must be in the form: --key=value"
    - code: "INVALID_CUSTOM_VARIABLE"
      message: "Invalid custom variable option syntax: {value}"
  configuration:
    - code: "INVALID_PATTERN"
      message: "Invalid regex pattern: {pattern}"
    - code: "MISSING_PATTERN"
      message: "Pattern is required for {type}"
    - code: "INVALID_CONFIG"
      message: "Invalid configuration: {reason}"
``` 