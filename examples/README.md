# Examples

このディレクトリには、breakdownparamsライブラリの使用例を示すスクリプトが含まれています。
各exampleは特定のユースケースを想定し、内部にパラメータを保持しています。

## 実行順序

以下の順序でexampleを実行することを推奨します：

1. `help.ts` - ヘルプ表示の基本
2. `basic_usage.ts` - 基本的な使用方法
3. `options_usage.ts` - オプションの使用方法
4. `config_usage.ts` - 設定ファイルの使用方法
5. `user_variable_options_usage.ts` - カスタム変数の使用方法
6. `extended_params_usage.ts` - 拡張パラメータの使用方法
7. `error_handling.ts` - エラー処理の確認
8. `custom_config_usage.ts` - カスタム設定による自然な英語コマンド
9. `project_management_usage.ts` - プロジェクト管理ツールの例
10. `ai_processing_usage.ts` - AI/ML処理ツールの例

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
- 無効なdirective type
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

- カスタムdirective typeのバリデーション
- カスタムlayer typeのバリデーション
- パターンベースのバリデーション
- カスタムエラーメッセージ

想定されるユースケース：

- カスタムコマンドの追加
- カスタムレイヤーの追加
- バリデーションルールのカスタマイズ
- エラーメッセージのカスタマイズ

## カスタム変数オプション使用例 (`user_variable_options_usage.ts`)

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

## カスタム設定例 (`custom_config_usage.ts`)

カスタム設定を使用した自然な英語コマンドの例を示します：

- タスク分解ツールの実装（breakdown, split, divideなど）
- 自然な英語のコマンド構造
- 理解しやすいターゲット名（simple, manageable, smallerなど）

想定されるユースケース：

- 複雑なタスクの分解
- 大きなファイルの分割
- コードのリファクタリング
- ドキュメントの変換

## プロジェクト管理例 (`project_management_usage.ts`)

プロジェクト管理ツールの実装例を示します：

- プロジェクト管理アクション（create, update, assignなど）
- プロジェクトエンティティ（ticket, epic, sprintなど）
- 実務的なコマンド例

想定されるユースケース：

- チケットの作成・更新
- スプリントの管理
- バックログの優先度付け
- マイルストーンの追跡

## AI処理例 (`ai_processing_usage.ts`)

AI/ML処理ツールの実装例を示します：

- AIモデルの操作（train, fine-tune, deployなど）
- モデル・データタイプ（model, dataset, pipelineなど）
- 実用的なMLワークフロー

想定されるユースケース：

- モデルのトレーニング
- ファインチューニング
- モデルの最適化・圧縮
- プロダクションへのデプロイ

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
deno run --allow-env examples/user_variable_options_usage.ts
deno run --allow-env examples/extended_params_usage.ts
deno run --allow-env examples/error_handling.ts

# カスタム設定の例
deno run --allow-env examples/custom_config_usage.ts
deno run --allow-env examples/project_management_usage.ts
deno run --allow-env examples/ai_processing_usage.ts
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
