設計の方針を docs/architecture/ 配下へまとめてある。
今回、Option処理について実装に未反映の「差分」箇所を実施する。

# 差分:
`tmp/param_validate_with_option.ja.md` に記載した内容が、実装に未反映である。
パラメータとオプションを分けて、それぞれ検証しているものの、
パラメータ＆オプションの組み合わせチェックが欠けている。

# 実装:
まずArchitecture, Structures のテストを整える。この2種類に変更を加えて完成させて。
つまり、 tests/0_architecture と tests/1_structreus のテストが pass するまで、他のテストは変更しない。

# テスト実行:
1. `deno task ci` を用いて実行する
2. 実行結果のメッセージを「入力指示」と同等に受け止め、次の実行を行う
3. デバッグには、デバッグ出力を入れて状態変化を追う（DEBUG時のみ出力する）
4. 修正後にメインコードからデバッグ出力を削除する（テストは残したまま）


# 既知の修正:

- オプション名は内部的にキーとして保持し、-f, --file を同じキーで識別
- ParamsParser の仕様を見直し、params と options を正しく分離して TwoParamValidator にはパラメータのみを渡す

