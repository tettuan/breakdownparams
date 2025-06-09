設計の方針を docs/architecture/ 配下へまとめてある。
今回、FlagOption処理について別の補足ファイルを作成した。この修正内容を把握し、実装に反映したい。

修正内容:
tmp/flag_options.ja.md の修正が該当する。
オプションの詳細は、 docs/options.ja.md や用語集を見て欲しい。


実装:
src/, および tests/ に実装して。
まずは、Architecture, Structures のみを実装し、テストを完成させて。

つまり、 tests/0_architecture と tests/1_structreus のテストが pass するまで、他の実装には進まない。

