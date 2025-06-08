# Examples

このディレクトリには、breakdownparamsライブラリの使用例を示すスクリプトが含まれています。
各exampleは特定のユースケースを想定し、内部にパラメータを保持しています。

## 実行順序

以下の順序でexampleを実行することを推奨します：

1. `help.ts` - ヘルプ表示の基本
2. `basic_usage.ts` - 基本的な使用方法
3. `options_usage.ts` - オプションの使用方法
4. `config_usage.ts` - 設定ファイルの使用方法
5. `custom_variable_options_usage.ts` - カスタム変数の使用方法
6. `extended_params_usage.ts` - 拡張パラメータの使用方法
7. `error_handling.ts` - エラー処理の確認

各exampleは前のexampleの知識を前提としています。

## 基本使用例 (`basic_usage.ts`)

基本的なコマンドライン引数の解析例を示します：

- コマンド処理（`init`, `to`, `summary`, `defect`）
- レイヤータイプ処理（`project`, `issue`, `task`）
- ヘルプとバージョンフラグ

想定されるユースケース：
- アプリケーションの初期化
- レイヤー間の変換
- サマリーの生成
- 不具合の報告

## エラー処理例 (`error_handling.ts`)

エラー処理とバリデーションの例を示します：

- 無効なコマンドの検出
- 引数が多すぎる場合
- 無効なdemonstrative type
- 無効なlayer type

想定されるユースケース：
- 不正なコマンドの検出
- 不正なオプションの検出
- 不正な値の検出
- エラーメッセージの表示

## オプション使用例 (`options_usage.ts`)

コマンドラインオプションの使用例を示します：

- 長形式と短縮形のオプション
- ファイル入出力オプション
- レイヤータイプの変換

想定されるユースケース：
- ファイルの変換
- レイヤー間の変換
- プロンプトの適応
- 設定ファイルの使用

## 設定オプション使用例 (`config_usage.ts`)

設定オプションの使用例を示します：

- 長形式と短縮形の設定オプション
- 他のオプションとの組み合わせ
- 異なるモードでの設定オプションの動作

想定されるユースケース：
- 設定ファイルの使用
- 環境ごとの設定切り替え
- 設定の共有
- 設定の検証

## 拡張パラメータ使用例 (`extended_params_usage.ts`)

カスタムパラメータバリデーションの使用例を示します：

- カスタムdemonstrative typeのバリデーション
- カスタムlayer typeのバリデーション
- パターンベースのバリデーション
- カスタムエラーメッセージ

想定されるユースケース：
- カスタムコマンドの追加
- カスタムレイヤーの追加
- バリデーションルールのカスタマイズ
- エラーメッセージのカスタマイズ

## カスタム変数オプション使用例 (`custom_variable_options_usage.ts`)

カスタム変数オプションの使用例を示します：

- カスタム変数の定義
- カスタム変数の使用
- カスタム変数のバリデーション
- カスタム変数の組み合わせ

想定されるユースケース：
- プロジェクト固有の変数
- バージョン情報の管理
- 環境設定の管理
- カスタムメタデータの管理

## ヘルプ表示例 (`help.ts`)

ヘルプ表示の例を示します：

- ヘルプメッセージの表示
- バージョン情報の表示
- 使用例の表示
- オプションの説明

想定されるユースケース：
- コマンドの使用方法確認
- バージョン情報の確認
- オプションの確認
- 使用例の確認

## 実行方法

各exampleは内部にパラメータを保持しており、以下のように実行できます：

```bash
# 推奨される実行順序
deno run --allow-env examples/help.ts
deno run --allow-env examples/basic_usage.ts
deno run --allow-env examples/options_usage.ts
deno run --allow-env examples/config_usage.ts
deno run --allow-env examples/custom_variable_options_usage.ts
deno run --allow-env examples/extended_params_usage.ts
deno run --allow-env examples/error_handling.ts
```

## テスト方法

exampleのテストは以下のように実行できます：

```bash
# 全exampleのテスト
deno test --allow-env --allow-write --allow-read examples/*.ts

# 個別のexampleのテスト
deno test --allow-env --allow-write --allow-read examples/<example_file.ts>
```

デバッグ時は`LOG_LEVEL`環境変数を使用できます：

```bash
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read examples/<example_file.ts>
```
