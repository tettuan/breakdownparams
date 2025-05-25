「仕様理解」を行ったあと、「ParamsParser責務分割の確認」をする。
ミッション完了に向けて、再帰的に実行すること。

# ミッション：実装の確認と修正
ParamsParser の責務分割

# 仕様理解

まず、用語集 `docs/glossary.md` で関係性を把握して。
`docs/params.md`, `params_type.md` は必読。
必要に応じ、`docs/index.md` から参照される仕様書を読む。

- Chat: 日本語、 Codebase: English

## ユースケース：

必要なタイミングで、プロジェクトのREADME を読み、ユースケースを理解する。

# ParamsParser責務分割の確認

以下の分割案を踏まえ、実装が適切に施されたか確認する。

- テスト駆動でテストが作成されているか
- 実装が仕様に沿って変更されているか

## 1. コアクラス

### ParamsParser (src/params_parser.ts)
- メインのエントリーポイント
- 引数の種類に応じた適切なパーサーへの振り分け
- 結果の型安全な返却

## 2. パーサー群

### NoParamsParser (src/parsers/no_params_parser.ts)
- パラメータなしの場合の解析
- ヘルプ/バージョンフラグの処理

### SingleParamParser (src/parsers/single_param_parser.ts)
- 単一パラメータ（init等）の解析
- コマンドの検証

### DoubleParamsParser (src/parsers/double_params_parser.ts)
- 二重パラメータの解析
- 指示型とレイヤー型の組み合わせ検証

## 3. バリデーター群

### DemonstrativeTypeValidator (src/validators/demonstrative_type_validator.ts)
- 指示型の検証
- 拡張モード対応

### LayerTypeValidator (src/validators/layer_type_validator.ts)
- レイヤー型の検証
- エイリアス処理

### OptionsValidator (src/validators/options_validator.ts)
- オプションの検証
- カスタム変数の検証

## 4. セキュリティ

### SecurityValidator (src/validators/security_validator.ts)
- 禁止文字のチェック
- パターンマッチング
- 最大値制限

## 5. 型定義

### types.ts (src/types.ts)
- 各種型定義
- エラー情報の型定義

## 6. ユーティリティ

### OptionParser (src/utils/option_parser.ts)
- オプションの解析
- 長形式/短形式の処理

### ErrorFactory (src/utils/error_factory.ts)
- エラーオブジェクトの生成
- エラーメッセージの管理
