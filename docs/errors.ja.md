# エラー仕様

このドキュメントは、breakdownparamsライブラリのエラー処理の仕様を定義します。

## 1. エラーの種類

エラーは以下のカテゴリに分類されます：

1. **バリデーションエラー**
   - パラメータの値が制約を満たさない場合
   - オプションの形式が不正な場合
   - カスタム変数オプションの構文が不正な場合

2. **設定エラー**
   - パーサーの設定が不正な場合
   - 正規表現パターンが無効な場合
   - 必須の設定値が欠落している場合

3. **セキュリティエラー**
   - 二段階セキュリティバリデータ（`SecurityValidator`）が検出する違反
   - 5 カテゴリ： `shellInjection`（Phase 1・全引数対象）／`absolutePath`／`homeExpansion`／`parentTraversal`／`specialChars`（後者 4 つは Phase 2・`kind: 'path'` の値オプションのみ）
   - 適用強度は `CustomConfig.security.policy` の `Level`（`'off'` / `'safe'` / `'strict'`）で制御

## 2. エラーコードとメッセージ

### 2.1 バリデーションエラー

| エラーコード | メッセージ | 説明 |
|------------|------------|------|
| INVALID_DIRECTIVE_TYPE | "Invalid directive type. Must be one of: to, summary, defect" | DirectiveTypeの値が制約を満たさない |
| INVALID_LAYER_TYPE | "Invalid layer type. Must be one of: project, issue, task" | LayerTypeの値が制約を満たさない |
| INVALID_OPTION_FORMAT | "Invalid option format. Must be in the form: --key=value" | オプションの形式が不正 |
| INVALID_USER_VARIABLE | "Invalid user variable option syntax: {value}" | カスタム変数オプションの構文が不正 |
| TOO_MANY_ARGUMENTS | "Too many arguments. Maximum 2 arguments are allowed." | 引数の数が制限を超えている |
| MISSING_REQUIRED_PARAM | "Missing required parameter: {param}" | 必須パラメータが欠落している |

### 2.2 設定エラー

| エラーコード | メッセージ | 説明 |
|------------|------------|------|
| INVALID_PATTERN | "Invalid regex pattern: {pattern}" | 正規表現パターンが無効 |
| MISSING_PATTERN | "Pattern is required for {type}" | 必須のパターン設定が欠落 |
| INVALID_CONFIG | "Invalid configuration: {reason}" | 設定値が不正 |

### 2.3 セキュリティエラー

すべてのセキュリティ違反は単一のエラーコード `SECURITY_ERROR` として返されます。具体的にどのカテゴリが拒否したかはメッセージに含まれます。

| エラーコード | メッセージ形式 | 説明 |
|------------|----------------|------|
| SECURITY_ERROR | "Security error: &lt;category&gt; violation in &lt;context&gt;" | 二段階セキュリティバリデータが違反を検出 |

- `<category>`: `shellInjection` / `absolutePath` / `homeExpansion` / `parentTraversal` / `specialChars`
- `<context>`: `option <name>`（`--name=...` / `-x=...`）、`argument`（`--uv-*`）、または `positional`（位置引数）
- 例： `Security error: parentTraversal violation in option from`

#### 二段階実行と対象範囲

- **Phase 1 (`validatePhase1`)**: 生の引数列に対して実行。`shellInjection` のみを全引数に一律適用する。ここではオプションの識別がまだ行われないため、その他 4 カテゴリはスコープ外。
- **Phase 2 (`validatePhase2`)**: オプション解決後に、解決済みの `(optionName, value)` ペアに対して実行。`kind: 'path'` の値オプションに対してのみ 4 カテゴリ（`absolutePath` / `homeExpansion` / `parentTraversal` / `specialChars`）を適用する。

判定は first-hit-wins の順序で行う： `shellInjection` → `absolutePath` → `homeExpansion` → `parentTraversal` → `specialChars`。

#### カテゴリ別強度

`CustomConfig.security.policy`（`Level` または `SecurityCategoryLevels`）で制御する：

- `'off'`: 検査を無効化
- `'safe'`: 既定。高精度パターンを拒否
- `'strict'`: エンコード変種などを含む広い集合を拒否

値オプション単位では `OptionDefinition.securityPolicy` でカテゴリ別に上書きできる（ただし `shellInjection` は Phase 1 で動くため上書き不可）。カテゴリ別の正規表現と具体例は [セキュリティ検証](development.ja.md#セキュリティ検証)、[セキュリティポリシー](custom_params.ja.md#8-セキュリティポリシー) を参照。

#### 対象外

- **`--uv-*`（ユーザー変数）**: `kind` を持たないため 4 パス系カテゴリは適用されない。ただし `shellInjection`（Phase 1）は引き続き適用される。`../`、`..\\`、`...`、narrative text、複数行などは素通りするが、`;` `|` `&` `<` `>` などのシェルメタ文字は拒否される。
- **位置引数（directiveType / layerType / `init` など）**: `kind` を持たないため 4 パス系カテゴリは適用されない。`shellInjection` のみ適用される。

## 3. エラー結果の構造

```typescript
interface ErrorResult {
  type: "error";
  error: {
    code: string;
    message: string;
    details?: {
      param?: string;
      value?: string;
      pattern?: string;
      reason?: string;
    };
  };
}
```

## 4. エラー処理の流れ

1. **エラーの検出**
   - バリデーション処理中にエラーを検出
   - 設定値の検証中にエラーを検出
   - セキュリティチェック中にエラーを検出

2. **エラー情報の構築**
   - エラーコードの設定
   - エラーメッセージの生成
   - 詳細情報の追加（必要な場合）

3. **エラー結果の返却**
   - ErrorResultオブジェクトの作成
   - エラー情報の設定
   - 呼び出し元への返却

## 5. エラーハンドリングの例

### 5.1 バリデーションエラー

```typescript
// 不正なDirectiveType
{
  type: "error",
  error: {
    code: "INVALID_DIRECTIVE_TYPE",
    message: "Invalid directive type. Must be one of: to, summary, defect",
    details: {
      value: "invalid"
    }
  }
}

// 不正なオプション形式
{
  type: "error",
  error: {
    code: "INVALID_OPTION_FORMAT",
    message: "Invalid option format. Must be in the form: --key=value",
    details: {
      value: "--from input.md"
    }
  }
}
```

### 5.2 設定エラー

```typescript
// 無効な正規表現パターン
{
  type: "error",
  error: {
    code: "INVALID_PATTERN",
    message: "Invalid regex pattern: [invalid",
    details: {
      pattern: "[invalid"
    }
  }
}

// 設定値の欠落
{
  type: "error",
  error: {
    code: "MISSING_PATTERN",
    message: "Pattern is required for directiveType",
    details: {
      type: "directiveType"
    }
  }
}
```

## 6. エラー処理の制約

1. **エラーメッセージの一貫性**
   - エラーメッセージは明確で具体的であること
   - エラーの原因と解決方法を示すこと
   - 一貫した形式を維持すること

2. **エラーコードの命名規則**
   - 大文字のスネークケースを使用
   - エラーの種類を明確に示す
   - 一意であること

3. **詳細情報の提供**
   - 必要な場合のみ詳細情報を含める
   - 機密情報を含まないこと
   - デバッグに役立つ情報を提供すること

## 7. エラー処理のベストプラクティス

1. **エラーの早期検出**
   - 可能な限り早い段階でエラーを検出
   - エラーの伝播を最小限に抑える

2. **適切なエラーレベル**
   - エラーの重要度に応じて適切なレベルを設定
   - 不要なエラーを避ける

3. **エラーの集約**
   - 関連するエラーを適切に集約
   - エラーの重複を避ける

4. **エラーの回復**
   - 可能な場合は回復処理を提供
   - ユーザーに適切なガイダンスを提供

---

[日本語版](errors.ja.md) | [English Version](errors.md) 