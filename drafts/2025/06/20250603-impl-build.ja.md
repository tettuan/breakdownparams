設計の方針を docs/architecture/ 配下へまとめてある。
今回、Option処理について追記した。この変更差分を、docs/architecture/の1つ前のコミット差分で調べ、実装に反映したい。

# 差分:
docs/architecture/ を 前回コミットからdiff して、差分を把握して。
オプションの詳細は、 docs/options.ja.md や用語集を見て欲しい。


# 実装:
Architecture, Structures はテストが整っている。この2つに変更を加えず、実装のみテストを完成させて。
つまり、 tests/0_architecture と tests/1_structreus のテストが pass したので、変更をくわえない。

残り、
`tests/2_impliments` 配下にテストを実装し、完全にpassするまで構築を進めて。

## 問題発生時:
なお、architectureやstructureに変更を生じさせるような、構造上の問題があった場合は、処理を停止し、 tmp/architecture_issue.ja.md を作成して問題点を記載すること。

# テスト実行:
1. `deno task ci` を用いて実行する
2. 実行結果のメッセージを「入力指示」と同等に受け止め、次の実行を行う
3. デバッグには、デバッグ出力を入れて状態変化を追う（DEBUG時のみ出力する）
4. 修正後にメインコードからデバッグ出力を削除する（テストは残したまま）


# 既知の修正:

- オプション名は内部的にキーとして保持し、-f, --file を同じキーで識別
- コードは設計ドキュメントで定義された Option の種類（ValueOption、FlagOption、CustomVariableOption）をより適切に反映する
  - specialCases は FlagOption を表す名称へ変更する
- ParamsParser の仕様を見直し、params と options を正しく分離して TwoParamValidator にはパラメータのみを渡す
