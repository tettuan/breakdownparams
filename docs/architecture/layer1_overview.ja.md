# アーキテクチャ概要

このドキュメントは、breakdownparamsライブラリのアーキテクチャの概要を説明します。

## 1. コアコンセプト

### 1.1 最上位の目的
オプションクラス中心の設計により、各オプションが自身の正規化、検証、変換ロジックを保持し、パラメータとオプションの処理を明確に分離する。

```mermaid
graph TD
    A[CLI Args] --> B[OptionFactory]
    B --> C[Option Instances]
    C --> D[ParamsParser]
    D --> E1[Extract Params]
    D --> E2[Extract Options]
    E1 --> F[ParamsValidator]
    E2 --> G[Option.validate()]
    F --> H[パラメータタイプ判定]
    G --> H
    H --> I1[ZeroOptionValidator]
    H --> I2[OneOptionValidator]
    H --> I3[TwoOptionValidator]
    I1 --> J[Option Combination Validation]
    I2 --> J
    I3 --> J
    J --> K[結果統合]
    K --> L[ParamsResult]
```

### 1.2 責務の分離
- **オプションクラス**: 自身の正規化、検証、変換ロジックを保持
- **OptionFactory**: CLI引数からOptionインスタンスを生成
- **ParamsParser**: Optionインスタンスを使用してパラメータとオプションを処理
- **バリデータ**: パラメータとオプションの組み合わせ検証に特化
- パラメータの検証結果に基づいて適切なオプション検証を実行

### 1.3 パラメータの3区分
パラメータの検証結果は3つの型に分類される：

```typescript
type ParamsResult =
  | ZeroParamsResult   // パラメータなし
  | OneParamsResult     // init のみ
  | TwoParamsResult     // 指示型 + レイヤー型
  | ErrorResult;       // エラー
```

## 2. 主要コンポーネント

### 2.1 パーサー（ParamsParser）

```typescript
interface ParamsParser {
  parse(args: string[]): ParamsResult;
}
```

- **責務**:
  1. 3つのパラメータバリデータを同時に作成
  2. パラメータの検証結果に基づいて適切なオプションバリデータを選択
  3. オプションの個別検証を実行
  4. オプションの組み合わせ検証を実行
  5. 検証結果を統合して適切な結果型を返却

- **重要な制約**:
  - ParamsResultは必ずParamsParserによって作成
  - バリデータから受け取った型を直接返却することは禁止
  - 全ての処理をバリデーションに移譲し、結果を判定してParamsResultを作成
  - パラメータの検証結果に基づいて適切なオプション検証を実行

### 2.2 パラメータバリデータ（ParamsValidator）

```typescript
interface ParamsValidator {
  validate(args: string[]): ValidationResult;
}
```

- **種類**:
  - ZeroParamsValidator: パラメータなしの検証
  - OneParamValidator: init のみの検証
  - TwoParamValidator: 指示型とレイヤー型の検証

- **判定ルール**:
  - 成功・失敗・失敗: ZeroParamsResult
  - 失敗・成功・失敗: OneParamsResult
  - 失敗・失敗・成功: TwoParamsResult
  - その他: ErrorResult

### 2.3 オプション（Option）

```typescript
interface Option {
  // 基本プロパティ
  readonly rawInput: string;
  readonly canonicalName: string;
  readonly longForm: string;
  readonly shortForm?: string;
  
  // 判定メソッド
  isShorthand(): boolean;
  isLongForm(): boolean;
  isCustomVariable(): boolean;
  matchesInput(input: string): boolean;
  
  // 変換メソッド
  toNormalized(): string;
  toLong(): string;
  toShort(): string | undefined;
  
  // バリデーション
  validate(): ValidationResult;
  getValue(): string | boolean;
}
```

- **種類**:
  - FlagOption: フラグオプション
  - ValueOption: 値付きオプション
  - CustomVariableOption: ユーザー変数オプション（--uv-*）

- **責務**:
  - 自身の入力形式の判定（ショート/ロング）
  - 正規化された名前の提供
  - 自身のバリデーション
  - 値の抽出と提供

## 3. 処理フロー

1. **入力**: CLIコマンドライン引数
2. **オプション生成**:
   - OptionFactoryが各引数に対してOptionインスタンスを生成
   - 各Optionが自身の入力形式を判定し、内部状態を設定
3. **パラメータ・オプション分離**:
   - ParamsParserがOptionインスタンスのコレクションを受け取る
   - option.toNormalized()で正規化された名前を取得
   - option.getValue()で値を取得
4. **検証**:
   - パラメータの検証（3つのバリデータで同時に実行）
   - 各option.validate()を呼び出し
   - オプションの組み合わせ検証を実行
5. **結果統合**:
   - パラメータの結果にオプションの結果を含める
   - ParamsParserが適切な結果型を作成
6. **出力**: 統合された結果（正規化された形式）

## 4. 使用例

```typescript
const parser = new ParamsParser();

// パラメータとオプションの検証を実行し、結果を統合
const result = parser.parse(["init", "--from=input.md"]);

// 結果に応じた処理
if (result.type === "one") {
  // OneParamsResult の処理
  // オプションの結果も含まれている
} else if (result.type === "error") {
  // ErrorResult の処理
}
```

## 5. 制約と設計原則

### 5.1 オプションクラスの原則
- 各オプションクラスは自身の正規化ロジックを保持
- 入力形式（ショート/ロング）の判定は自身で行う
- 内部表現と外部表現を明確に分離
- ユーザー変数も先頭のハイフンを除去した正規化（`--uv-*` → `uv-*`）

### 5.2 処理の制約
- パラメータとオプションの検証は完全に独立
- パラメータの結果は必ず3区分のいずれか
- オプションの結果はパラメータの結果に含まれる
- 各バリデータは単一の責務のみを持つ
- ParamsResultは必ずParamsParserによって作成
- バリデータの結果型を直接返却することは禁止
- パラメータの検証結果に基づいて適切なオプション検証を実行
- オプションの個別検証の後に組み合わせ検証を実行

---

[日本語版](layer1_overview.ja.md) | [English Version](layer1_overview.md) 