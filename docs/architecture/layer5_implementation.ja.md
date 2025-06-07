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
  private optionRegistry: OptionRegistry;

  constructor(config?: ParserConfig) {
    this.config = config || DEFAULT_CONFIG;
    this.validators = this.createValidators();
    this.optionRegistry = new OptionRegistry();
    this.registerDefaultOptions();
  }

  private registerDefaultOptions(): void {
    // 標準オプションの登録
    this.optionRegistry.register(new ValueOption(
      'from',
      ['f'],
      false,
      'Input file path',
      (v) => ({ isValid: v.length > 0, errors: [] })
    ));

    this.optionRegistry.register(new ValueOption(
      'destination',
      ['o'],
      false,
      'Output file path',
      (v) => ({ isValid: v.length > 0, errors: [] })
    ));

    this.optionRegistry.register(new FlagOption(
      'help',
      ['h'],
      'Show help message'
    ));

    this.optionRegistry.register(new FlagOption(
      'version',
      ['v'],
      'Show version information'
    ));
  }

  public parse(args: string[]): ParamsResult {
    const results = this.validators.map(v => v.validate(args));
    return this.determineResult(results);
  }

  private createValidators(): ParamsValidator[] {
    return [
      new ZeroParamValidator(this.config, this.optionRegistry),
      new OneParamValidator(this.config, this.optionRegistry),
      new TwoParamValidator(this.config, this.optionRegistry)
    ];
  }
}
```

### 6.2 バリデータの実装

```typescript
abstract class BaseValidator implements ParamsValidator {
  protected config: ParserConfig;
  protected optionRegistry: OptionRegistry;

  constructor(config: ParserConfig, optionRegistry: OptionRegistry) {
    this.config = config;
    this.optionRegistry = optionRegistry;
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

  protected validateOptions(args: string[]): void {
    const options = this.extractOptions(args);
    for (const [name, value] of Object.entries(options)) {
      const option = this.optionRegistry.get(name);
      if (option) {
        const result = option.validate(value);
        if (!result.isValid) {
          throw new Error(result.errors.join(", "));
        }
      } else if (name.startsWith("uv-")) {
        if (!this.optionRegistry.validateCustomVariable(name)) {
          throw new Error(`Invalid custom variable name: ${name}`);
        }
      }
    }
  }

  protected extractOptions(args: string[]): Record<string, string> {
    const options: Record<string, string> = {};
    for (const arg of args) {
      if (arg.startsWith("--")) {
        const [name, value] = arg.slice(2).split("=");
        options[name] = value || "";
      }
    }
    return options;
  }
}
```

### 6.3 オプションの実装

```typescript
class ValueOption implements Option {
  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly isRequired: boolean,
    readonly description: string,
    private validator: (value: string) => ValidationResult
  ) {}

  validate(value: string | undefined): ValidationResult {
    if (this.isRequired && !value) {
      return { isValid: false, errors: [`${this.name} is required`] };
    }
    if (value) {
      return this.validator(value);
    }
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): string | undefined {
    return value;
  }
}

class FlagOption implements Option {
  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string
  ) {}

  validate(value: string | undefined): ValidationResult {
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): boolean {
    return value !== undefined;
  }
}

class CustomVariableOption implements Option {
  constructor(
    readonly name: string,
    readonly description: string,
    private pattern: RegExp
  ) {}

  validate(value: string | undefined): ValidationResult {
    if (!this.pattern.test(this.name)) {
      return { 
        isValid: false, 
        errors: [`Invalid custom variable name: ${this.name}`] 
      };
    }
    return { isValid: true, errors: [] };
  }

  parse(value: string | undefined): string | undefined {
    return value;
  }
}
```

### 6.4 エラー処理の実装

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

  static createOptionError(
    name: string,
    message: string
  ): ErrorInfo {
    return {
      code: "INVALID_OPTION",
      message,
      details: {
        option: name
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

### 7.2 カスタムオプションの使用

```typescript
const parser = new ParamsParser();

// カスタムオプションの登録
parser.optionRegistry.register(new ValueOption(
  'template',
  ['t'],
  false,
  'Template file path',
  (v) => ({ isValid: v.endsWith('.md'), errors: [] })
));

// カスタム変数の使用
const result = parser.parse([
  "to",
  "project",
  "--template=template.md",
  "--uv-name=test-project"
]);

if (result.type === "break") {
  console.log(`Template: ${result.options.template}`);
  console.log(`Custom Variable: ${result.options['uv-name']}`);
}
```

### 7.3 エラー処理の使用

```typescript
try {
  const parser = new ParamsParser();
  const result = parser.parse([
    "to",
    "project",
    "--from=",  // 空の値
    "--invalid" // 無効なオプション
  ]);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation Error: ${error.message}`);
    console.error(`Details:`, error.details);
  }
}
```

## 8. バリデーション実装の詳細

### 8.1 コアインターフェース

#### 8.1.1 オプションルールインターフェース
```typescript
interface OptionRule {
  format: string;
  validation: {
    customVariables: string[];
    emptyValue: string;
    unknownOption: string;
    duplicateOption: string;
    requiredOptions: string[];
    valueTypes: string[];
  };
  flagOptions: Record<string, string>;
  paramSpecificOptions: {
    zero: ParamOptionRules;
    one: ParamOptionRules;
    two: ParamOptionRules;
  };
}

interface ParamOptionRules {
  allowedOptions: string[];
  requiredOptions: string[];
}
```

#### 8.1.2 バリデーション結果インターフェース
```typescript
interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    code: string;
  };
}
```

### 8.2 クラス実装

#### 8.2.1 パラメータ固有オプションバリデータ
```typescript
class ParamSpecificOptionValidator {
  constructor(private optionRule: OptionRule) {}

  validateForZero(options: Record<string, string | undefined>): ValidationResult {
    const rules = this.optionRule.paramSpecificOptions.zero;
    return this.validateOptions(options, rules);
  }

  validateForOne(options: Record<string, string | undefined>): ValidationResult {
    const rules = this.optionRule.paramSpecificOptions.one;
    return this.validateOptions(options, rules);
  }

  validateForTwo(options: Record<string, string | undefined>): ValidationResult {
    const rules = this.optionRule.paramSpecificOptions.two;
    return this.validateOptions(options, rules);
  }

  private validateOptions(
    options: Record<string, string | undefined>,
    rules: ParamOptionRules
  ): ValidationResult {
    // 許可されたオプションの検証
    for (const option of Object.keys(options)) {
      if (!rules.allowedOptions.includes(option)) {
        return {
          isValid: false,
          error: {
            message: `オプション '${option}' は許可されていません`,
            code: 'INVALID_OPTION'
          }
        };
      }
    }

    // 必須オプションの検証
    for (const required of rules.requiredOptions) {
      if (!(required in options)) {
        return {
          isValid: false,
          error: {
            message: `必須オプション '${required}' が指定されていません`,
            code: 'MISSING_OPTION'
          }
        };
      }
    }

    return { isValid: true };
  }
}
```

#### 8.2.2 パラメータパーサー
```typescript
class ParamsParser {
  constructor(
    private optionRule: OptionRule,
    private securityValidator: SecurityErrorValidator,
    private optionsValidator: OptionsValidator,
    private paramSpecificValidator: ParamSpecificOptionValidator
  ) {}

  parse(args: string[]): ParamsResult {
    // 1. セキュリティ検証
    const securityResult = this.securityValidator.validate(args);
    if (!securityResult.isValid) {
      return securityResult;
    }

    // 2. オプション検証
    const optionsResult = this.optionsValidator.validate(args);
    if (!optionsResult.isValid) {
      return optionsResult;
    }

    // 3. パラメータとオプションの分離
    const { params, options } = this.separateParamsAndOptions(args);

    // 4. パラメータ固有のオプション検証
    const paramSpecificResult = this.validateParamSpecificOptions(params, options);
    if (!paramSpecificResult.isValid) {
      return paramSpecificResult;
    }

    // 5. パラメータ検証
    return this.validateParams(params);
  }

  private separateParamsAndOptions(args: string[]): {
    params: string[];
    options: Record<string, string>;
  } {
    // 実装の詳細...
  }

  private validateParamSpecificOptions(
    params: string[],
    options: Record<string, string>
  ): ValidationResult {
    switch (params.length) {
      case 0:
        return this.paramSpecificValidator.validateForZero(options);
      case 1:
        return this.paramSpecificValidator.validateForOne(options);
      case 2:
        return this.paramSpecificValidator.validateForTwo(options);
      default:
        return {
          isValid: false,
          error: {
            message: 'パラメータの数が不正です',
            code: 'INVALID_PARAM_COUNT'
          }
        };
    }
  }

  private validateParams(params: string[]): ValidationResult {
    // 実装の詳細...
  }
}
```

## 9. 実装ガイドライン

### 9.1 実装の原則

1. **単一責任の原則**
   - 各バリデータは特定の検証のみを担当
   - コードの再利用性と保守性を促進
   - 関心の分離を明確に

2. **オープン・クローズドの原則**
   - 新しいパラメータパターンの追加が容易
   - 既存のコードを変更せずに拡張可能
   - 柔軟なバリデーションルール

3. **依存性逆転の原則**
   - インターフェースを通じた疎結合
   - テストとモックが容易
   - 明確な依存関係

### 9.2 実装手順

1. **インターフェースの定義**
   - コアインターフェースの定義
   - バリデーションルールの指定
   - 期待される動作の文書化

2. **バリデータの実装**
   - バリデーションロジックの実装
   - エッジケースの処理
   - 明確なエラーメッセージの提供

3. **テストの作成**
   - 各バリデータの単体テスト
   - パーサーの統合テスト
   - エラーケースのカバレッジ

4. **統合テスト**
   - エンドツーエンドのバリデーションフロー
   - エラーハンドリングシナリオ
   - パフォーマンステスト

### 9.3 エラーハンドリング

1. **バリデーションエラー**
   - 明確なエラーメッセージ
   - 定義されたエラーコード
   - 詳細なエラー情報

2. **例外処理**
   - 予期しないエラーの処理
   - エラーログの記録
   - 適切なエラー回復

---

[日本語版](layer5_implementation.ja.md) | [English Version](layer5_implementation.md) 