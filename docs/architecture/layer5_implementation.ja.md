# 実装仕様

## 1. 型定義

パラメータの種類は、位置引数の数に基づいて3つのタイプに分類されます：

1. **ZeroParams**
   - 位置引数なし
   - オプションのみ指定可能
   - 例：`breakdown --help`

2. **OneParam**
   - 位置引数1つ
   - 有効な値：`init`
   - 例：`breakdown init`

3. **TwoParams**
   - 位置引数2つ
   - 形式：`<demonstrativeType> <layerType>`
   - 例：`breakdown to project`

## 2. オプション定義

オプションは、ハイフン付きの引数として指定されます。各オプションは長形式と短縮形の両方をサポートします：

| ロングフォーム | ショートハンド | 説明                     |
| -------------- | -------------- | ------------------------ |
| --help         | -h             | ヘルプ表示               |
| --version      | -v             | バージョン表示           |
| --from         | -f             | 入力ファイル指定         |
| --destination  | -o             | 出力ファイル指定         |
| --input        | -i             | 入力レイヤー指定         |
| --adaptation   | -a             | プロンプト適応タイプ指定 |
| --config       | -c             | 設定ファイル名指定       |
| --uv-*         | なし           | カスタム変数オプション指定 |

## 3. バリデーション規則

### 3.1 引数の数

- 0個：オプションのみ許可
- 1個：`init`コマンドのみ許可
- 2個：demonstrativeTypeとlayerTypeの組み合わせ
- 3個以上：エラー

### 3.2 値の制約

- エイリアスは小文字のみ有効
- 未定義のエイリアスは無視
- ロングフォームが優先（ショートハンドと競合時）
- オプションの重複時は最後の指定が有効

### 3.3 オプションの優先順位

- ロングフォーム（--from, --destination, --input）が優先
- ショートハンド（-f, -o, -i）はロングフォームが未指定の場合のみ有効
- 同じオプションが複数回指定された場合、最後の指定が有効

### 3.4 大文字小文字の扱い

- レイヤータイプのエイリアスは小文字のみ有効
- 大文字を含むエイリアスは無効として扱う
- カスタム変数オプション名は大文字小文字を区別し、指定された通りに使用

### 3.5 カスタム変数オプションの制約

- TwoParamsモードでのみ使用可能
- 構文は`--uv-<name>=<value>`の形式を厳守
- 変数名は英数字とアンダースコアのみ許可
- 値は文字列として扱い、検証は行わない

## 4. バリデーション設定

### 4.1 設定値の構造

```typescript
interface ParserConfig {
  demonstrativeType: {
    pattern: string;
    errorMessage?: string;
  };
  layerType: {
    pattern: string;
    errorMessage?: string;
  };
}
```

### 4.2 デフォルト設定

```typescript
const DEFAULT_CONFIG: ParserConfig = {
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

### 4.3 カスタム設定

```typescript
const customConfig: ParserConfig = {
  demonstrativeType: {
    pattern: "^[a-z]+$",
    errorMessage: "Invalid demonstrative type"
  },
  layerType: {
    pattern: "^[a-z]+$",
    errorMessage: "Invalid layer type"
  }
};
```

## 5. エラー定義

### 5.1 エラー情報

```typescript
interface ErrorInfo {
  code: string;
  message: string;
  details?: {
    param?: string;
    value?: string;
    pattern?: string;
    reason?: string;
  };
}
```

### 5.2 エラーケース

| エラーケース       | メッセージ例                                           |
| ------------------ | ------------------------------------------------------ |
| 引数過多           | "Too many arguments. Maximum 2 arguments are allowed." |
| 不正な値           | "Invalid demonstrative type. Must be one of: to, summary, defect" |
| 必須パラメータ不足 | "Missing required parameter: {param}"                  |
| カスタム変数オプション構文エラー | "Invalid custom variable option syntax: {value}"  |
| 設定エラー         | "Invalid configuration: pattern is required"           |

## 6. 実装詳細

### 6.1 パーサーの実装

```typescript
class ParamsParser {
  private config: ParserConfig;
  private validators: ParamsValidator[];

  constructor(config?: ParserConfig) {
    this.config = config || DEFAULT_CONFIG;
    this.validators = this.createValidators();
  }

  public parse(args: string[]): ParamsResult {
    const results = this.validators.map(v => v.validate(args));
    return this.determineResult(results);
  }

  private createValidators(): ParamsValidator[] {
    return [
      new ZeroParamValidator(this.config),
      new OneParamValidator(this.config),
      new TwoParamValidator(this.config)
    ];
  }
}
```

### 6.2 バリデータの実装

```typescript
abstract class BaseValidator implements ParamsValidator {
  protected config: ParserConfig;

  constructor(config: ParserConfig) {
    this.config = config;
  }

  public validate(args: string[]): ValidationResult {
    try {
      this.checkSecurity(args);
      this.validateOptions(args);
      return this.validateParams(args);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }
}
```

### 6.3 エラー処理の実装

```typescript
class ErrorFactory {
  static createValidationError(
    code: string,
    message: string,
    details?: Record<string, string>
  ): ErrorInfo {
    return {
      code,
      message,
      details
    };
  }

  static createConfigError(
    type: string,
    pattern: string
  ): ErrorInfo {
    return {
      code: "INVALID_CONFIG",
      message: `Invalid configuration for ${type}`,
      details: {
        type,
        pattern
      }
    };
  }
}
```

## 7. 使用例

### 7.1 基本的な使用

```typescript
const parser = new ParamsParser();
const result = parser.parse(["to", "project", "--from=input.md"]);

if (result.type === "break") {
  console.log(`Demonstrative Type: ${result.demonstrativeType}`);
  console.log(`Layer Type: ${result.layerType}`);
  console.log(`From File: ${result.options.fromFile}`);
}
```

### 7.2 カスタム設定での使用

```typescript
const customConfig: ParserConfig = {
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

### 7.3 エラーハンドリング

```typescript
try {
  const result = parser.parse(args);
  if (result.error) {
    console.error(`Error: ${result.error.message}`);
    if (result.error.details) {
      console.error("Details:", result.error.details);
    }
  }
} catch (error) {
  console.error("Unexpected error:", error);
}
```

---

[日本語版](layer5_implementation.ja.md) | [English Version](layer5_implementation.md) 