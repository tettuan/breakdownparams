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
   - 形式：`<directiveType> <layerType>`
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
| --uv-*         | なし           | ユーザー変数オプション指定 |

## 3. バリデーション規則

### 3.1 引数の数

- 0個：オプションのみ許可
- 1個：`init`コマンドのみ許可
- 2個：directiveTypeとlayerTypeの組み合わせ
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
- ユーザー変数オプション名は大文字小文字を区別し、指定された通りに使用

### 3.5 ユーザー変数オプションの制約

- TwoParamsモードでのみ使用可能
- 構文は`--uv-<name>=<value>`の形式を厳守
- 変数名は英数字とアンダースコアのみ許可
- 値は文字列として扱い、検証は行わない

## 4. バリデーション設定

### 4.1 設定値の構造

```typescript
interface ParserConfig {
  directiveType: {
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
  directiveType: {
    pattern: "^(to|summary|defect)$",
    errorMessage: "Invalid directive type. Must be one of: to, summary, defect"
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
  directiveType: {
    pattern: "^[a-z]+$",
    errorMessage: "Invalid directive type"
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
| 不正な値           | "Invalid directive type. Must be one of: to, summary, defect" |
| 必須パラメータ不足 | "Missing required parameter: {param}"                  |
| ユーザー変数オプション構文エラー | "Invalid user variable option syntax: {value}"  |
| 設定エラー         | "Invalid configuration: pattern is required"           |

## 6. 実装詳細

### 6.1 パーサーの実装

```typescript
class ParamsParser {
  private config: ParserConfig;
  private validators: ParamsValidator[];
  private optionFactory: OptionFactory;

  constructor(config?: ParserConfig) {
    this.config = config || DEFAULT_CONFIG;
    this.validators = this.createValidators();
    this.optionFactory = new OptionFactory(this.config);
  }

  public parse(args: string[]): ParamsResult {
    // OptionFactoryでOptionインスタンスを生成
    const options = this.optionFactory.createOptions(args);
    
    // Optionインスタンスから正規化された値を取得
    const normalizedArgs = this.extractNormalizedArgs(options);
    
    // パラメータ検証
    const results = this.validators.map(v => v.validate(normalizedArgs));
    
    // オプション検証
    const optionResults = this.validateOptions(options);
    
    return this.determineResult(results, optionResults);
  }

  private extractNormalizedArgs(options: Option[]): string[] {
    return options.filter(opt => !opt.isOption())
      .map(opt => opt.getValue() as string);
  }

  private validateOptions(options: Option[]): ValidationResult[] {
    return options.filter(opt => opt.isOption())
      .map(opt => opt.validate());
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
  console.log(`Directive Type: ${result.directiveType}`);
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

// ユーザー変数の使用
const result = parser.parse([
  "to",
  "project",
  "--template=template.md",
  "--uv-name=test-project"
]);

if (result.type === "break") {
  console.log(`Template: ${result.options.template}`);
  console.log(`User Variable: ${result.options['uv-name']}`); // 正規化後: uv-name
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

---

[日本語版](layer5_implementation.ja.md) | [English Version](layer5_implementation.md) 