# アーキテクチャ概要

このドキュメントは、breakdownparamsライブラリのアーキテクチャの概要を説明します。

## 1. 主要コンポーネント

### 1.1 パーサー（ParamsParser）

```typescript
interface ParamsParser {
  parse(args: string[]): ParamsResult;
}
```

- **責務**:
  - CLIコマンドラインのパラメータとオプションを解析
  - バリデーション結果に基づいて適切な結果型を返却
  - エラー情報の集約と管理

- **特徴**:
  - 公開APIとして提供
  - 内部処理の詳細を隠蔽
  - バリデーション結果の型安全性を保証

### 1.2 バリデータ（ParamsValidator）

```typescript
interface ParamsValidator {
  validate(args: string[]): ValidationResult;
}
```

- **責務**:
  - パラメータとオプションの検証
  - バリデーションルールの適用
  - エラー情報の生成

- **種類**:
  - ZeroParamsValidator: パラメータなしの検証
  - OneParamValidator: 単一パラメータの検証
  - TwoParamValidator: 二重パラメータの検証

### 1.3 オプション処理（Option）

```typescript
interface Option {
  readonly name: string;           // 長形式名
  readonly aliases: string[];      // 短縮形の配列
  readonly type: OptionType;       // オプションの種類
  readonly isRequired: boolean;    // 必須かどうか
  readonly description: string;    // 説明文

  validate(value: string | undefined): ValidationResult;
  parse(value: string | undefined): OptionValue;
}
```

- **責務**:
  - オプションの定義と管理
  - オプション値のバリデーション
  - オプション値の変換

- **種類**:
  - ValueOption: 値を持つオプション（--from=value）
  - FlagOption: フラグオプション（--help）
  - CustomVariableOption: カスタム変数オプション（--uv-*）

## 2. 設計原則

### 2.1 バリデーション中心の設計

- 全ての処理をバリデーションに移譲
- バリデーション結果に基づく型安全な結果生成
- エラー情報の一貫した管理

### 2.2 設定による柔軟性

- 正規表現パターンによるバリデーション
- デフォルト設定値の提供
- カスタム設定値のサポート

### 2.3 エラー処理の統一

- エラーコードの標準化
- エラーメッセージの一貫性
- 詳細情報の適切な提供

### 2.4 オプションの独立性

- オプション処理はパラメータ処理から完全に独立
- 各オプションは自己完結的なバリデーションとパース処理を持つ
- オプションの登録と解析を動的に行える

## 3. データフロー

1. **入力**:
   - CLIコマンドライン引数
   - 設定値（オプション）

2. **処理**:
   - パラメータの解析
   - オプションの解析
   - バリデーションの実行
   - 結果の生成

3. **出力**:
   - 型安全な結果オブジェクト
   - エラー情報（必要な場合）

## 4. バリデーションルール

### 4.1 デフォルト設定

```typescript
const DEFAULT_CONFIG = {
  demonstrativeType: {
    pattern: "^(to|summary|defect)$",
    errorMessage: "Invalid demonstrative type. Must be one of: to, summary, defect"
  },
  layerType: {
    pattern: "^(project|issue|task)$",
    errorMessage: "Invalid layer type. Must be one of: project, issue, task"
  }
};
```

### 4.2 カスタム設定

- 正規表現パターンのカスタマイズ
- エラーメッセージのカスタマイズ
- バリデーションルールの拡張

### 4.3 オプション設定

```typescript
const OPTION_CONFIG = {
  valueOption: {
    pattern: "^[a-zA-Z0-9._-]+$",
    errorMessage: "Invalid option value"
  },
  customVariable: {
    pattern: "^uv-[a-zA-Z0-9_]+$",
    errorMessage: "Invalid custom variable name"
  }
};
```

## 5. エラー処理

### 5.1 エラーの種類

- バリデーションエラー
- 設定エラー
- セキュリティエラー
- オプションエラー

### 5.2 エラー情報

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
      option?: string;
    };
  };
}
```

## 6. 使用例

### 6.1 デフォルト設定での使用

```typescript
const parser = new ParamsParser();
const result = parser.parse(["to", "project", "--from=input.md"]);
```

### 6.2 カスタム設定での使用

```typescript
const customConfig = {
  demonstrativeType: {
    pattern: "^[a-z]+$",
    errorMessage: "Invalid demonstrative type"
  },
  layerType: {
    pattern: "^[a-z]+$",
    errorMessage: "Invalid layer type"
  }
};

const parser = new ParamsParser(customConfig);
const result = parser.parse(["custom", "layer", "--from=input.md"]);
```

### 6.3 オプションの使用

```typescript
const registry = new OptionRegistry();

// 値を持つオプション
registry.register(new ValueOption(
  "from",
  ["f"],
  true,
  "Source file path",
  (value) => ({ isValid: true, errors: [] })
));

// フラグオプション
registry.register(new FlagOption(
  "help",
  ["h"],
  "Show help information"
));

// カスタム変数オプション
registry.register(new CustomVariableOption(
  "uv-project",
  "Project name",
  /^uv-[a-zA-Z0-9_]+$/
));
```

## 7. 制約と制限

### 7.1 パラメータの制限

- 最大2つの位置引数
- オプションは `--key=value` 形式
- カスタム変数オプションは `--uv-*` 形式

### 7.2 バリデーションの制限

- 正規表現パターンの有効性チェック
- 必須設定値の存在確認
- セキュリティチェックの実施

### 7.3 オプションの制限

- オプション名は小文字のみ
- カスタム変数名は英数字とアンダースコアのみ
- 値は文字列または真偽値

## 8. 拡張性

### 8.1 設定の拡張

- バリデーションルールのカスタマイズ
- エラーメッセージのカスタマイズ
- パターンの拡張

### 8.2 機能の拡張

- 新しいバリデータの追加
- 新しいオプションの追加
- 新しいエラー処理の追加

### 8.3 オプションの拡張

- 新しいオプションタイプの追加
- カスタムバリデーションルールの実装
- オプション値の変換ルールの拡張

---

[日本語版](layer1_overview.ja.md) | [English Version](layer1_overview.md) 