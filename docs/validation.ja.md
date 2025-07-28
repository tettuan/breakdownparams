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
  - DirectiveTypeValidator:
      - directive type の検証
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
      - directive type と layer type の検証
      - カスタム変数オプションの検証

# バリデーション設定

ParserConfig:
  directiveType:
    pattern: string  # 正規表現パターン
    errorMessage?: string  # カスタムエラーメッセージ
  layerType:
    pattern: string  # 正規表現パターン
    errorMessage?: string  # カスタムエラーメッセージ

# デフォルト設定値

DEFAULT_CONFIG:
  directiveType:
    pattern: "^(to|summary|defect)$"
    errorMessage: "Invalid directive type. Must be one of: to, summary, defect"
  layerType:
    pattern: "^(project|issue|task)$"
    errorMessage: "Invalid layer type. Must be one of: project, issue, task"

# オプションフォーマット定義

format:
  # 基本フォーマット
  long: "--key=value"     # 長形式のフォーマット
  short: "-k=value"       # 短形式のフォーマット
  
  # パターン定義
  pattern:
    key: "[a-zA-Z0-9-]+"  # キー名の文字種制限（英数字とハイフンのみ）
    value: ".+"           # 値の制限（空でない任意の文字列）
  
  # 特殊ケース
  special_cases:
    - "-c=value" -> "configFile"
    - "--config=value" -> "configFile"
    - "--help" -> "help"
    - "--version" -> "version"
  
  # カスタム変数
  user_variables:
    prefix: "--uv-"       # カスタム変数のプレフィックス
    pattern: "--uv-[a-zA-Z0-9-]+=.+"  # カスタム変数の完全パターン

# バリデーションルール

validation:
  # 値の検証
  empty_value: "error"    # 空値の扱い（error: エラー、warn: 警告、allow: 許可）
  unknown_option: "error" # 未知のオプションの扱い
  duplicate: "error"      # 重複の扱い
  
  # 必須オプション
  required_options: []    # 必須オプションのリスト
  
  # 値の型チェック
  value_types: ["string"] # 許可される値の型

# エラー定義

errors:
  validation:
    - code: "INVALID_DIRECTIVE_TYPE"
      message: "Invalid directive type. Must be one of: to, summary, defect"
    - code: "INVALID_LAYER_TYPE"
      message: "Invalid layer type. Must be one of: project, issue, task"
    - code: "INVALID_OPTION_FORMAT"
      message: "Invalid option format. Must be in the form: --key=value"
    - code: "INVALID_USER_VARIABLE"
      message: "Invalid user variable option syntax: {value}"
  configuration:
    - code: "INVALID_PATTERN"
      message: "Invalid regex pattern: {pattern}"
    - code: "MISSING_PATTERN"
      message: "Pattern is required for {type}"
    - code: "INVALID_CONFIG"
      message: "Invalid configuration: {reason}"
```