「仕様理解」を行ったあと、「パラメータバリデーション修正」し、「実装の自動修正」に着手する。

# ミッション：実装の確認と修正

最新の仕様を把握し、エラーを修正する。
再帰的アルゴリズムで実行し、全ての修正を完了させる。


# 仕様理解

まず、用語集 `docs/glossary.md` で関係性を把握して。
`docs/params.md`, `docs/params_type.md`, `docs/options.md` は必読。
必要に応じ、`docs/index.md` から参照される仕様書を読む。

その後、src/ 配下のファイル一覧を調べ、構造を理解する。PATHエラーに役立てる。


## ユースケース：

必要なタイミングで、プロジェクトのREADME を読み、ユースケースを理解する。

# パラメータバリデーション修正

- examples/config_usage.ts の現状出力は 意図しないエラー。
- `deno run --allow-env examples/config_usage.ts to project --config test`
  - Error: Too many arguments. Maximum 2 arguments are allowed.
- config オプションを受け取り、返すことができるよう、実装に修正を入れる。

# 実装の自動修正

1. `deno task ci` を実行する
2. エラーに対し、 CursorRules, `docs/testing.md` を理解する
3. エラーメッセージに添えられた "Next Action" 指示に従う
3-1. 処理に際し、テストにデバッグログを追加する。エラー箇所のテストコード前後にBreakdownLoggerの出力を追加する。
4. 再び `deno task ci` を実行する
5. 不明点や曖昧さがあれば、ミッションと `docs/` を起点に仕様書を探し、読んで、解決策を導く。
6. エラー修正のために1へ戻る

上記を再帰的に実行し、全ての修正を完了させる。


# 既知の修正方針
- zero validator 実装では --config なども許可してしまっているため、仕様に合わせて isValidOption を help/version のみ許可する
