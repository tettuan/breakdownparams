# ユーザー変数オプション仕様

## 概要
このドキュメントは、アプリケーションのコマンドラインオプションとしてユーザー変数オプションを実装するための仕様を定義します。ユーザー変数は「user variable」の略で`uv`というプレフィックスを使用します。

## オプション形式
- ユーザー変数は `--uv-*` 形式で定義されます
- プレフィックス `--uv-` はすべてのユーザー変数で固定です
- `*` の部分がユーザー変数名を表します
- 複数のユーザー変数を同時に指定できます
- 内部的に `uv-*` 形式に正規化されます（先頭のハイフンを除去）

## オプション一覧

| オプション形式 | 説明                 | 値の型  | 必須   | 例                        | 正規化形式   |
| ------------- | -------------------- | ------- | ------ | ------------------------- | -------------- |
| --uv-*        | ユーザー変数         | string  | いいえ | `--uv-project=myproject`  | `uv-project`   |

## 構文
```bash
--uv-<name>=<value>
```

- `<name>`: 変数名（必須）
- `<value>`: 変数の値（必須）

## ルールと制約

### 変数名の検証
- ユーザー変数名は以下を満たす必要があります：
  - 英数字とアンダースコア、ハイフンのみを含む
  - 先頭は英字である必要があります
  - 大文字小文字を区別する
  - 空でないこと
  - 検証はCustomVariableOptionクラスが実施

### 値の検証
- 値は有効なターミナル入力であれば何でも受け入れます
- 特定の形式の制限はありません
- 値は `=` 記号の後に指定する必要があります
- 空の値も許可されます

## 使用例

### 単一変数
```bash
breakdown to project --uv-project=myproject
```

### 複数変数
```bash
breakdown to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production
```

### 複雑な値
```bash
breakdown to project --uv-path=/usr/local/bin --uv-config={"key":"value"} --uv-array=[1,2,3]
```

## 実装上の注意点
1. OptionFactoryが`--uv-*`引数に対してCustomVariableOptionインスタンスを生成します
2. 各ユーザー変数は`uv-*`形式に正規化されます（例：`--uv-config` → `uv-config`）
3. CustomVariableOptionクラスが自身の正規化とバリデーションを処理します
4. 無効な変数名のエラー処理はOptionクラス内で実装されます
5. 実装はオプションクラス中心設計パターンに従います

## エラーケース

| エラーケース            | メッセージ例                                           |
| ----------------------- | ------------------------------------------------------ |
| 不正な変数名形式        | "Invalid user variable name format: {name}"            |
| 値の指定なし            | "Missing value for user variable: {name}"              |
| 重複する変数名          | "Duplicate user variable name: {name}"                 |
| 不正な構文              | "Invalid user variable syntax: {option}"               |
| 不正なパラメータタイプ  | "User variables are only available with TwoParams"     |

## 型定義

### ユーザー変数の型
```typescript
type UserVariables = {
  [key: `uv-${string}`]: string;  // 正規化形式: uv-*
};
```

### 戻り値の型の統合
```typescript
interface OptionParams {
  // ... 既存のプロパティ ...
  [key: `uv-${string}`]: string;  // ユーザー変数は正規化されたキーで直接含まれる
}
```

### 型の使用例
```typescript
// ユーザー変数を含む戻り値の例（正規化済み）
{
  from: "input.md",
  destination: "output.md",
  "uv-project": "myproject",      // --uv-projectから正規化
  "uv-version": "1.0.0",          // --uv-versionから正規化
  "uv-environment": "production"  // --uv-environmentから正規化
}

// ユーザー変数が空の場合（--uv-* オプションが指定されていない場合）
{
  from: "input.md",
  destination: "output.md"
  // uv-*プロパティなし
}
```

### 型の制約
- ユーザー変数は`uv-*`キーで戻り値の型に直接含まれます
- キーは`uv-*`形式に正規化されます（先頭のハイフンを除去）
- 値は常に文字列で、コマンドラインからの入力をそのまま保持します
- ユーザー変数は TwoParams モードでのみ存在します
- ユーザー変数が提供されていない場合、プロパティは追加されません

## 既存の仕様との互換性

### パラメータタイプの互換性
- ユーザー変数は TwoParams モードでのみ利用可能です
- `--config` オプションと同様に、ユーザー変数は以下では無視されます：
  - ZeroParams
  - OneParam
- 例：`breakdown to project --uv-environment=prod` （`uv-environment`に正規化）

### 大文字小文字の区別
- ユーザー変数名は大文字小文字を区別し、指定された通りに使用する必要があります
- 正規化ではハイフンのみを除去し、大文字小文字は保持されます
- 変数名の大文字小文字は保持され、値にアクセスする際に一致する必要があります
- 例：`--uv-Project` → `uv-Project`、`--uv-project` → `uv-project`（異なる変数）

### オプションの優先順位
- ユーザー変数は既存のオプションと同じ優先順位ルールに従う必要があります
- 他のオプションと組み合わせた場合、ユーザー変数はそれらの機能を妨げてはいけません
- すべてのオプションは一貫して正規化されます（例：`--help` → `help`、`--uv-env` → `uv-env`）
- 例：`breakdown to project --config test --uv-environment=prod`

### エラー処理
- 無効なユーザー変数はCustomVariableOptionクラスで処理されます
- 不正な構文（`=` の欠落）はOptionバリデーションを通じてエラーを生成します
- バリデーションエラーはOptionインスタンスのvalidate()メソッドから返されます

### ドキュメントの統合
- ユーザー変数は以下のドキュメントに記載する必要があります：
  - `docs/options.ja.md`
  - `docs/glossary.ja.md`
  - `docs/params.ja.md`
- 既存のドキュメントセクションに使用例を追加する必要があります
- 正規化ルールを明確に説明する必要があります

### テスト要件
- ユニットテストは以下をカバーする必要があります：
  - すべてのパラメータタイプ（ZeroParams, OneParam, TwoParams）
  - 既存のオプションとの組み合わせ
  - 正規化動作（--uv-* → uv-*）
  - エラーケース
  - エッジケース（空の値、特殊文字）
- 統合テストは以下を検証する必要があります：
  - エンドツーエンドの機能
  - ドキュメントの正確性
  - エラーメッセージの一貫性 

---

[日本語版](custom_variable_options.ja.md) | [English Version](custom_variable_options.md) 