# テスト仕様

## テスト設計原則

テストは以下の原則に従って設計されています：

1. **段階的な複雑性**
   - 基本機能から始まり、徐々に複雑なユースケースへと進む
   - 各段階で必要な前提条件が満たされていることを確認
   - 前段階のテストが成功していることを前提とする

2. **階層的な構造**
   - 単体テスト（実装ファイルと同じ階層に配置）
   - アーキテクチャテスト（実装ファイルと同じ階層に配置）
   - 構造テスト（実装ファイルと同じ階層に配置）
   - 結合テスト（tests/配下に配置）
   - E2Eテスト（tests/配下に配置）

3. **テストファイルの配置**
   - 単体/アーキテクチャ/構造テスト: 実装ファイルと同じ階層
   - 結合/E2Eテスト: tests/ディレクトリ配下

4. **実行順序の保証**
   - 依存関係に基づいた実行順序の制御
   - 前段階のテストが成功していることを確認

## テストディレクトリ構造

```
src/
├── models/
│   ├── model.ts
│   ├── 0_architecture_model.ts # アーキテクチャテスト
│   ├── 1_structure_model.ts   # 構造テスト
│   └── 2_unit_model.ts        # 単体テスト
│
├── types/
│   ├── type.ts
│   ├── 0_architecture_type.ts
│   ├── 1_structure_type.ts
│   └── 2_unit_type.ts
│
└── parser/
    ├── params_parser.ts
    ├── 0_architecture_params_parser.ts
    ├── 1_structure_params_parser.ts
    └── 2_unit_params_parser.ts

tests/
├── integration/             # 結合テスト
│   └── 3_integration_params_parser.ts
│
└── e2e/                    # E2Eテスト
    └── 4_e2e_params_parser.ts
```

## テストファイル命名規則

テストファイルは、その目的に応じて以下の命名規則に従います：

1. **アーキテクチャテスト**
   - 命名規則: `0_architecture_<実装ファイル名>.ts`
   - 例: `0_architecture_model.ts`
   - 用途: アーキテクチャの制約や依存関係の検証
   - 配置: 実装ファイルと同じ階層
   - 検証項目:
     - 依存関係の方向性
     - 循環参照の有無
     - レイヤー間の境界
     - インターフェースの一貫性

2. **構造テスト**
   - 命名規則: `1_structure_<実装ファイル名>.ts`
   - 例: `1_structure_model.ts`
   - 用途: クラス構造や責務分離の検証
   - 配置: 実装ファイルと同じ階層
   - 検証項目:
     - 単一責任の原則の遵守
     - 責務の重複の有無
     - 適切な抽象化レベル
     - クラス間の関係性

3. **単体テスト**
   - 命名規則: `2_unit_<実装ファイル名>.ts`
   - 例: `2_unit_model.ts`
   - 用途: 機能の動作検証
   - 配置: 実装ファイルと同じ階層

4. **結合テスト**
   - 命名規則: `3_integration_<機能名>.ts`
   - 例: `3_integration_params_parser.ts`
   - 用途: 複数のコンポーネント間の連携検証
   - 配置: tests/integration/

5. **E2Eテスト**
   - 命名規則: `4_e2e_<機能名>.ts`
   - 例: `4_e2e_params_parser.ts`
   - 用途: エンドツーエンドの動作検証
   - 配置: tests/e2e/

## テストの依存関係

テストは以下の順序で実行されます：

1. モデルと型のテスト
   - 基本的なデータ構造と型の検証
   - バリデーションルールの検証

2. 派生コンポーネントのテスト
   - モデルや型を利用した機能の検証
   - Factoryやユーティリティの検証

3. ParamsParserのテスト
   - 個別の機能検証
   - 全体の統合検証

### 依存関係の例

```
models/
  └── model.ts
      ├── 0_architecture_model.ts
      ├── 1_structure_model.ts
      └── 2_unit_model.ts

types/
  └── type.ts
      ├── 0_architecture_type.ts
      ├── 1_structure_type.ts
      └── 2_unit_type.ts

parser/
  └── params_parser.ts
      ├── 0_architecture_params_parser.ts
      ├── 1_structure_params_parser.ts
      └── 2_unit_params_parser.ts

tests/
  ├── integration/
  │   └── 3_integration_params_parser.ts
  └── e2e/
      └── 4_e2e_params_parser.ts
```

## テスト実行手順

### 推奨: 一括テスト・CIフローのローカル実行

プロジェクト全体のテスト・フォーマット・Lintチェックを一括で実行するには、以下のスクリプトを利用してください。

```bash
deno task ci
```

- CIと同等のフローをローカルで再現します。
- すべてのテストを依存関係順に実行し、テスト通過後にフォーマット・Lintチェックを行います。
- エラー時は `LOG_LEVEL=debug deno task ci` で詳細なデバッグ出力が得られます。
- コミット・プッシュ・マージ前に必ずこのスクリプトで全チェックを通過させてください。

### 特定のテストファイルの実行

```bash
deno test <test_file.ts> --allow-env --allow-write --allow-read --allow-run
```

## デバッグ出力

BreakdownLogger をテストコードで「のみ」利用する。
メインコードにデバッグ出力を加える際は、BreakdownLogger を使わず、後で削除できるように明示的に console.debug( "[DEBUG]" ) を記載すること。

### テストコードでの使用

```typescript
import { BreakdownLogger } from '@tettuan/breakdownlogger';

const logger = new BreakdownLogger();
logger.debug('テスト実行開始', { testName: 'example' });
```

### ログレベル

- `debug`: 詳細なデバッグ情報
- `info`: 重要な処理の開始/終了
- `warn`: 警告（回復可能なエラー）
- `error`: エラー（処理中断）

## エラー処理とデバッグ

### エラー発生時の調査手順

1. デバッグログの確認
2. テスト環境の状態確認
3. 関連するテストケースの実行
4. エラー再現手順の文書化

### テスト失敗時の対応

1. エラーメッセージの確認
2. デバッグモードでの再実行
3. 関連する実装の確認
4. テスト失敗の前処理判定
5. 修正と再テスト

### テスト失敗の前処理判定

- テストの目的ではない前処理で失敗した場合、別の処理前のテストが必要。
- 前処理のテストは local_ci.sh で先に実行済みとなるように、実行順を前段階で配置する。
- 前処理の例：
  - 設定判定のテストだが設定ファイルの読み込みに失敗する
    - 設定ファイルの読み込みテストを作る
- 前処理ではない例:
  - 設定判定のテストで設定値が一致しないため失敗する
- テストの前処理は、該当テストより前に実施された確認済みプロセスを利用すること。後工程のテストが独自実装しないことが重要。

# スケルトンコードの構築順序(テスト駆動)

- 実装ファイルと同じ階層にテストファイルを作成する
- スケルトンの作成：テスト項目を、先にテスト対象として記述する（まだテストの内容は書かない）
- スケルトンには、テストが失敗する記述を入れておく
- コメントを記載する
  - あなたが他人のコードを読んだときに「知りたい」と思うことを記載する
  - テストの意図や目的、テストした方が良いと考えた理由を記述する
  - テストが扱う対象を明記する

---
