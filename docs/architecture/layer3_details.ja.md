# アーキテクチャ詳細

このドキュメントは、breakdownparamsライブラリのアーキテクチャの詳細を説明します。

## 1. クラス詳細

### 1.1 ParamsParser

```typescript
class ParamsParser {
  private config: ParserConfig;
  private validators: ParamsValidator[];
  private optionRegistry: OptionRegistry;

  constructor(config?: ParserConfig) {
    this.config = config || DEFAULT_CONFIG;
    this.validators = this.createValidators();
    this.optionRegistry = new OptionRegistry();
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

  private determineResult(results: ValidationResult[]): ParamsResult {
    // 成功・失敗の組み合わせに基づいて結果を判定
    const [zero, one, two] = results;
    if (zero.isValid() && !one.isValid() && !two.isValid()) {
      return this.createZeroParamResult(zero);
    }
    if (!zero.isValid() && one.isValid() && !two.isValid()) {
      return this.createOneParamResult(one);
    }
    if (!zero.isValid() && !one.isValid() && two.isValid()) {
      return this.createTwoParamResult(two);
    }
    return this.createErrorResult();
  }
}
```

### 1.2 BaseValidator

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

  protected abstract validateParams(args: string[]): ValidationResult;

  protected checkSecurity(args: string[]): void {
    // セキュリティチェックの実装
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
      }
    }
  }

  protected createErrorResult(error: Error): ValidationResult {
    return {
      isValid: false,
      error: this.createErrorInfo(error)
    };
  }
}
```

### 1.3 TwoParamValidator

```typescript
class TwoParamValidator extends BaseValidator {
  protected validateParams(args: string[]): ValidationResult {
    if (args.length !== 2) {
      return this.createErrorResult(new Error("Invalid number of arguments"));
    }

    const [demonstrativeType, layerType] = args;
    
    if (!this.validateDemonstrativeType(demonstrativeType)) {
      return this.createErrorResult(new Error("Invalid demonstrative type"));
    }

    if (!this.validateLayerType(layerType)) {
      return this.createErrorResult(new Error("Invalid layer type"));
    }

    return {
      isValid: true,
      demonstrativeType,
      layerType,
      options: this.parseOptions(args)
    };
  }

  private validateDemonstrativeType(value: string): boolean {
    return new RegExp(this.config.demonstrativeType.pattern).test(value);
  }

  private validateLayerType(value: string): boolean {
    return new RegExp(this.config.layerType.pattern).test(value);
  }

  private parseOptions(args: string[]): OptionParams {
    const options = this.extractOptions(args);
    const result: OptionParams = {};
    
    for (const [name, value] of Object.entries(options)) {
      const option = this.optionRegistry.get(name);
      if (option) {
        result[name] = option.parse(value);
      }
    }
    
    return result;
  }
}
```

### 1.4 OptionRegistry

```typescript
class OptionRegistry {
  private options: Map<string, Option>;
  private customVariablePattern: RegExp;

  constructor() {
    this.options = new Map();
    this.customVariablePattern = /^uv-[a-zA-Z0-9_]+$/;
  }

  public register(option: Option): void {
    this.options.set(option.name, option);
    for (const alias of option.aliases) {
      this.options.set(alias, option);
    }
  }

  public get(name: string): Option | undefined {
    return this.options.get(name);
  }

  public validateCustomVariable(name: string): boolean {
    return this.customVariablePattern.test(name);
  }

  public getAll(): Option[] {
    return Array.from(this.options.values());
  }
}
```

### 1.5 ValueOption

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
```

### 1.6 FlagOption

```typescript
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
```

### 1.7 CustomVariableOption

```typescript
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

## 2. インターフェース詳細

### 2.1 ParamsValidator

```typescript
interface ParamsValidator {
  validate(args: string[]): ValidationResult;
}
```

### 2.2 ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  error?: ErrorInfo;
  demonstrativeType?: string;
  layerType?: string;
  options?: OptionParams;
}
```

### 2.3 ParserConfig

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

### 2.4 Option

```typescript
interface Option {
  readonly name: string;
  readonly aliases: string[];
  readonly type: OptionType;
  readonly isRequired: boolean;
  readonly description: string;

  validate(value: string | undefined): ValidationResult;
  parse(value: string | undefined): OptionValue;
}

enum OptionType {
  VALUE,
  FLAG,
  CUSTOM_VARIABLE
}

type OptionValue = string | boolean | undefined;
```

## 3. エラー処理詳細

### 3.1 ErrorInfo

```typescript
interface ErrorInfo {
  code: string;
  message: string;
  details?: {
    param?: string;
    value?: string;
    pattern?: string;
    reason?: string;
    option?: string;
  };
}
```

### 3.2 エラー生成

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

## 4. バリデーション詳細

### 4.1 セキュリティチェック

```typescript
class SecurityValidator {
  static validate(args: string[]): void {
    // コマンドインジェクションの検出
    if (this.containsCommandInjection(args)) {
      throw new Error("Potential command injection detected");
    }

    // 不正な文字の検出
    if (this.containsInvalidCharacters(args)) {
      throw new Error("Invalid characters detected");
    }
  }

  private static containsCommandInjection(args: string[]): boolean {
    // コマンドインジェクション検出の実装
  }

  private static containsInvalidCharacters(args: string[]): boolean {
    // 不正な文字検出の実装
  }
}
```

### 4.2 オプション検証

```typescript
class OptionsValidator {
  static validate(args: string[], registry: OptionRegistry): void {
    const options = this.extractOptions(args);
    
    for (const [name, value] of Object.entries(options)) {
      const option = registry.get(name);
      if (option) {
        const result = option.validate(value);
        if (!result.isValid) {
          throw new Error(result.errors.join(", "));
        }
      } else if (name.startsWith("uv-")) {
        if (!registry.validateCustomVariable(name)) {
          throw new Error(`Invalid custom variable name: ${name}`);
        }
      }
    }
  }

  private static extractOptions(args: string[]): Record<string, string> {
    // オプション抽出の実装
  }
}
```

## 5. 設定詳細

### 5.1 デフォルト設定

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

### 5.2 カスタム設定

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

## 6. 使用例詳細

### 6.1 基本的な使用

```typescript
const parser = new ParamsParser();
const result = parser.parse(["to", "project", "--from=input.md"]);

if (result.type === "break") {
  console.log(`Demonstrative Type: ${result.demonstrativeType}`);
  console.log(`Layer Type: ${result.layerType}`);
  console.log(`From File: ${result.options.fromFile}`);
}
```

### 6.2 カスタム設定での使用

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

### 6.3 エラーハンドリング

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

[日本語版](layer3_details.ja.md) | [English Version](layer3_details.md) 