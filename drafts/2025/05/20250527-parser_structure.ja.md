「仕様理解」を行ったあと、「ParamsParser責務分割」をする。
その後「実装の自動修正」を行い、ミッション完了に向けて、再帰的に実行すること。

- Chat: 日本語、 Codebase: English

# ミッション：実装の確認と修正
ParamsParser の責務分割

# 仕様理解

まず、用語集 `docs/glossary.md` で関係性を把握して。
`docs/params.md`, `params_type.md`, `options.md` は必読。
必要に応じ、`docs/index.md` から参照される仕様書を読む。


# ParamsParser責務分割

ParamsParserが、パラメータチェックをバリデータへ移譲していることを確認し、移譲できていない場合は修正して。

- テスト駆動でテストが作成されているか
  - `docs/testing.ja.md`
- 実装が仕様に沿って変更されているか
  - `docs/validation.ja.md`


# 既知の修正方針

- OptionsValidator の validate メソッドで値が空の場合やイコール区切りで値がない場合は、code: ERROR_CODES.MISSING_OPTION_VALUE を返すようにします。
- `['project', 'issue', 'task']` は定数で一元化されているべきで、各所に点在させない
- パラメータの拡張モードと標準モードの区別を行う
- 具体レイヤーのIF文ではなく、抽象度を上げたオブジェクト指向の実装をする
- VALID_COMMANDS → ONE_PARAM_COMMANDS
ValidCommand → OneParamCommand
- DEMONSTRATIVE_TYPES を TWO_PARAM_FIRST_COMMANDS にリネーム
  パラメータ数が明確（TWO_PARAM_）
  位置が明確（FIRST_）
  コマンドの種類が明確（COMMANDS）
- エラーメッセージが[エラー制御アーキテクチャ設計](docs/architecture/error_handling.ja.md)されている


# 設計と一貫した実装をする

以下の観点で設計と実装の一貫性を重視した実装を行うこと:

1. 各クラスの責務が明確に分離されているか
2. インターフェースを通じた抽象化が適切に行われているか
3. 設定値や定数が一元管理されているか
4. 適切なデザインパターンが選択・実装されているか
5. テスト可能性が確保されているか

各バリデータは自分の責務のみを判定し、他のバリデータの責務には立ち入らない。
必要な判定は、バリデータの返却結果（Result）を使って、上位で判断する。
移譲前に責務外の判定をしてはならない。


# 実装の自動修正

1. `deno task ci` を実行する
2. エラーに対し、 CursorRules, `docs/testing.md` を理解する
3. エラーメッセージに添えられた "Next Action" 指示に従う
3-1. 処理に際し、テストにデバッグログを追加する。エラー箇所のテストコード前後に `BreakdownLogger` の出力を追加する。
4. 再び `deno task ci` を実行する
5. 不明点や曖昧さがあれば、ミッションと `docs/` を起点に仕様書を探し、読んで、解決策を導く。
6. エラー修正のために1へ戻る

上記を再帰的に実行し、全ての修正を完了させる。
