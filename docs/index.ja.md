# ライブラリ概要
https://deno.land/x に登録し、使われるライブラリ。
https://deno.land/x/breakdown から用いられる。

このライブラリでは、実行時パラメータを解析し、値を保持する。
バリデートしたあと、保持した値を返すところまでがスコープである。

## 行わないこと
パラメータ値の意味解釈は行わない。(ex. 「--helpだからヘルプ表示する」といったは、行わない)
デフォルト値は持たない。

# 引数のパターン
ハイフンなしのパラメータの個数で分岐する。
それぞれに応じたデータ構造で保持する。複数同時に存在しない。

- 0パラメータで、ハイフン付きの処理
  - アプリケーション自体のhelpやversion表示を行う特殊処理
- 1つのみ指定
  - アプリケーション自体の初期設定などを行う特殊処理
- 2つを指定
  - アプリケーションの実行を行う
  - ハイフン付きパラメータが、追加パラメータとなる
- 3つ以上を指定はエラー
- パラメータ無しの場合は空のパラメータ結果を返す

# 引数のパターンに応じた各処理
## 0パラメータで、ハイフン付きの処理

実行例：
```bash
./.deno/bin/breakdown -h
```

### 取りうる値
* -h, --help 
* -v, --version 

エイリアスが有効。
引数が存在することを示す。複数を同時に指定できる。

## 1つのみ指定

実行例：
```bash
./.deno/bin/breakdown init
```

### 取りうる値
* `init`

引数が何であることを示す。
例えば初期化処理のなかで「パラメータが `init` である」ということが確認できる。

## 2つを指定

実行パターン：
```bash
./.deno/bin/breakdown $1 $2
```

実行例：
```bash
./.deno/bin/breakdown to issue
```


1つ目のオプション($1)の名称を `DemonstrativeType` とする。
2つ目のオプション($2)の名称を `LayerType` とする。


### DemonstrativeType が取りうる値
* to
* summary
* defect


### LayerType が取りうる値
* project
* issue
* task

### ハイフン付きオプションの取りうる値

####  --from `<file>`
オプションの名称を FromFile とする。
エイリアスで `-f` を用いる。
以下は同じ処理になる。
````bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --from `<file>`
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -f `<file>`
````

##### FromFile の値
-　`<file>` 部分を取得する。
  - ex. `--from ./.agent/breakdown/issues/issue_summary.md` のとき、 `./.agent/breakdown/issues/issue_summary.md`

#### --destination `<output_file>`
オプションの名称を DestinationFile とする。
エイリアスで `-o` を用いる。
以下は同じ処理になる。
````bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType>  --destination `<output_file>`
./.deno/bin/breakdown <DemonstrativeType> <LayerType>  -o `<output_file>`
````

##### DestinationFile の値
-　`<output_file>` 部分を取得する。
  - ex. `--destination ./.agent/breakdown/issues/issue_summary.md` のとき、 `./.agent/breakdown/issues/issue_summary.md`

#### --input `<from_layer_type>`
オプションの名称を FromLayerType とする。
エイリアスで `-i` を用いる。
以下は同じ処理になる。
````bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType>  --input `<from_layer_type>`
./.deno/bin/breakdown <DemonstrativeType> <LayerType>  -i `<from_layer_type>`
````

##### from_layer_type の値
-　`<from_layer_type>` 部分を取得する。
  - ex. `--input issue` のとき、 `issue`
- from_layer_type が取りうる値は以下の値のみである。
  - project, pj, prj 
  - issue, story
  - task, todo, chore, style, fix, error, bug
- from_layer_type の値に応じて、共通の値へ変換した後に、保持する。例えば pj が渡されたとき project に変換して保持する。
  - project, pj, prj -> project 
  - issue, story -> issue
  - task, todo, chore, style, fix, error, bug -> task


# 引数の優先順位
- ショートハンドとロングフォームが同時に指定された場合の挙動は、ロングフォームを優先する。ロングフォームが主で、ショートハンドは短縮系のエイリアスとする。
- パス処理は行わない（加工しない）
- エイリアスの大文字小文字は、必ず小文字を使う（大文字は処理の対象としない。エラーにもしないで、無いものとして扱う）
- 未定義のエイリアスが指定された場合は、指定されなかった時と同様に無いものとして扱う。


