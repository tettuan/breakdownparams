```yaml
# パーサーとバリデータの依存関係

ParamsParser:
  - ZeroParamsParser:
      - BaseValidator
      - SecurityErrorValidator
      - OptionsValidator
      - ZeroParamValidator
  - OneParamParser:
      - BaseValidator
      - SecurityErrorValidator
      - OptionsValidator
      - OneParamValidator
      - DemonstrativeTypeValidator
  - TwoParamsParser:
      - BaseValidator
      - SecurityErrorValidator
      - OptionsValidator
      - TwoParamValidator
      - DemonstrativeTypeValidator
      - LayerTypeValidator

# 各バリデータの役割
validators:
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
      - 許可された型のチェック
  - LayerTypeValidator:
      - layer type の検証
      - 許可された型のチェック
  - ZeroParamValidator:
      - コマンドなしの引数パターンを検証
      - --help, --version フラグの処理
  - OneParamValidator:
      - 単一パラメータの検証
      - init コマンドの処理
  - TwoParamValidator:
      - 2つのパラメータの検証
      - demonstrative type と layer type の検証

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
``` 