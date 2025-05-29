# カスタム変数オプション仕様

## 概要
このドキュメントは、アプリケーションのコマンドラインオプションとしてカスタム変数オプションを実装するための仕様を定義します。

## オプション形式
- カスタム変数は `--uv-*` 形式で定義されます
- プレフィックス `--uv-` はすべてのカスタム変数で固定です
- `*` の部分がカスタム変数名を表します
- 複数のカスタム変数を同時に指定できます

## オプション一覧

| オプション形式 | 説明                 | 値の型  | 必須   | 例                        |
| ------------- | -------------------- | ------- | ------ | ------------------------- |
| --uv-*        | カスタム変数         | string  | いいえ | `--uv-project=myproject`  |

## 構文
```bash
--uv-<name>=<value>
```

- `<name>`: 変数名（必須）
- `<value>`: 変数の値（必須）

## ルールと制約

### 変数名の検証
- カスタム変数名は以下を満たす必要があります：
  - 英数字とアンダースコアのみを含む
  - 先頭は英字である必要があります
  - 大文字小文字を区別する
  - 空でないこと

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
1. オプションパーサーは複数の `--uv-*` オプションを処理できる必要があります
2. 各カスタム変数は名前と値のペアで保存する必要があります
3. システムは指定された順序で変数を維持する必要があります
4. 無効な変数名に対するエラー処理を実装する必要があります
5. 実装は既存のオプションと互換性がある必要があります

## エラーケース

| エラーケース            | メッセージ例                                           |
| ----------------------- | ------------------------------------------------------ |
| 不正な変数名形式        | "Invalid custom variable name format: {name}"          |
| 値の指定なし            | "Missing value for custom variable: {name}"            |
| 重複する変数名          | "Duplicate custom variable name: {name}"               |
| 不正な構文              | "Invalid custom variable syntax: {option}"             |
| 不正なパラメータタイプ  | "Custom variables are only available with TwoParams"|

## 型定義

### カスタム変数の型
```typescript
type CustomVariables = {
  [key: string]: string;
};
```

### 戻り値の型の統合
```typescript
interface OptionParams {
  // ... 既存のプロパティ ...
  customVariables?: CustomVariables;
}
```

### 型の使用例
```typescript
// カスタム変数を含む戻り値の例
{
  from: "input.md",
  destination: "output.md",
  customVariables: {
    "project": "myproject",
    "version": "1.0.0",
    "environment": "production"
  }
}

// カスタム変数が空の場合（--uv-* オプションが指定されていない場合）
{
  from: "input.md",
  destination: "output.md",
  customVariables: undefined
}
```

### 型の制約
- `CustomVariables` は戻り値の型のオプショナルプロパティです
- `CustomVariables` のキーはコマンドラインの変数名と一致する必要があります（大文字小文字を含む）
- 値は常に文字列で、コマンドラインからの入力をそのまま保持します
- この型は TwoParams モードでのみ存在します
- カスタム変数が提供されていない場合、プロパティは undefined になります

## 既存の仕様との互換性

### パラメータタイプの互換性
- カスタム変数は TwoParams モードでのみ利用可能です
- `--config` オプションと同様に、カスタム変数は以下では無視されます：
  - ZeroParams
  - OneParam
- 例：`breakdown to project --uv-environment=prod`

### 大文字小文字の区別
- カスタム変数名は大文字小文字を区別し、指定された通りに使用する必要があります
- 大文字小文字の変換や正規化は行われません
- 変数名の大文字小文字は保持され、値にアクセスする際に一致する必要があります
- 例：`--uv-Project` と `--uv-project` は異なる変数として扱われます

### オプションの優先順位
- カスタム変数は既存のオプションと同じ優先順位ルールに従う必要があります
- 他のオプションと組み合わせた場合、カスタム変数はそれらの機能を妨げてはいけません
- 例：`breakdown to project --config test --uv-environment=prod`

### エラー処理
- 無効なカスタム変数はエラーなしで無視されます（既存の動作と一致）
- ただし、不正な構文（`=` の欠落）はエラーを発生させる必要があります
- これにより、柔軟性と厳密な検証のバランスを取ります

### ドキュメントの統合
- カスタム変数は以下のドキュメントに記載する必要があります：
  - `docs/options.ja.md`
  - `docs/glossary.ja.md`
  - `docs/params.ja.md`
- 既存のドキュメントセクションに使用例を追加する必要があります

### テスト要件
- ユニットテストは以下をカバーする必要があります：
  - すべてのパラメータタイプ（ZeroParams, OneParam, TwoParams）
  - 既存のオプションとの組み合わせ
  - エラーケース
  - エッジケース（空の値、特殊文字）
- 統合テストは以下を検証する必要があります：
  - エンドツーエンドの機能
  - ドキュメントの正確性
  - エラーメッセージの一貫性 

---

[日本語版](custom_variable_options.ja.md) | [English Version](custom_variable_options.md) 