「仕様理解」を行ったあと、「ParamsResult名称変更」し、「実装の自動実行」に着手する。

# ミッション：網羅的な名称変更

広範囲に影響する型の名称変更を、完遂させる。
やり切ることが重要である。

# 仕様理解

まず、用語集 `docs/glossary.md` で関係性を把握して。
`docs/params.md`, `docs/params_type.md`, `docs/options.md` は必読。
必要に応じ、`docs/index.md` から参照される仕様書を読む。

その後、src/ 配下のファイル一覧を調べ、構造を理解する。PATHエラーに役立てる。

## ユースケース：

必要なタイミングで、プロジェクトのREADME を読み、ユースケースを理解する。

# ParamsResult名称変更

現在の名称                    → 新しい名称
--------------------------------------------------------
ParamsResult                 → ParamPatternResult
  ├─ ZeroParamResult         → ZeroParamResult
  ├─ SingleParamResult      → OneParamResult
  └─ DoubleParamsResult     → TwoParamResult

関連する型の変更：
--------------------------------------------------------
ParamValidator              → ParamPatternValidator
  ├─ ZeroParamValidator       → ZeroParamValidator
  ├─ SingleParamValidator   → OneParamValidator
  └─ DoubleParamValidator   → TwoParamValidator

関連するメソッドの変更：
--------------------------------------------------------
validateParams()            → validateParamPattern()
  ├─ validateZeroParams()     → validateZeroParams()
  ├─ validateSingleParam()  → validateOneParam()
  └─ validateDoubleParams() → validateTwoParams()

determineParamType()        → determineParamPattern()
createParamsResult()        → createParamPatternResult()

型パラメータの変更：
--------------------------------------------------------
ParamResult<ParamsResult>   → ParamResult<ParamPatternResult>


# 実装の自動実行

1. 実装部分の置き換えを実施（ src/ 配下の階層の全て ）
2. テストで利用している名称の置き換えを実施（ tests/ 配下 ）
3. 変換元の検索を行う
4. ファイル名の検索も行う
5. 未実施の置き換えをリスト化
6. 1へ戻って実行する


