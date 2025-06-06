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

### 2.5 オプション結果の評価

オプションのバリデーション結果は、`ValidationResult` インターフェースを通じて評価されます。この評価は、オプションの種類によって異なる動作を示します：

#### 2.5.1 評価の基本原則

```typescript
interface ValidationResult {
  isValid: boolean;  // バリデーションの成功/失敗を示す
  errors: string[];  // エラーメッセージの配列
}
```

- `isValid: true` の場合：
  - オプションが正しく指定されている
  - 値の検証が成功している（必要な場合）
  - エラーが存在しない

- `isValid: false` の場合：
  - オプションの指定に問題がある
  - 値の検証に失敗している
  - エラーメッセージが `errors` 配列に格納される

#### 2.5.2 オプションタイプ別の評価

1. **FlagOption（フラグオプション）**
```typescript
// フラグオプションの評価結果
const flagResult: ValidationResult = {
  isValid: true,  // フラグが指定されていれば有効
  errors: []      // エラーなし
};
```
- 値の検証は不要
- オプションが指定されていれば有効
- `isValid: true` は「フラグが有効」を意味する
- フラグオプションに値が指定された場合は `"Invalid option format"` エラーを返す
- フラグオプションの存在は `options` オブジェクトに値（`true` や `''`）を設定せず、`undefined` として扱う

##### フラグオプションの評価結果一覧

| 入力例 | 評価結果 | 説明 |
|--------|----------|------|
| `--help` | OK | フラグオプションが正しく指定されている |
| `--help=true` | NG | フラグオプションに値が指定されている（エラー） |
| `--version` | OK | フラグオプションが正しく指定されている |
| `--version=false` | NG | フラグオプションに値が指定されている（エラー） |
| `--help --version` | OK | 複数のフラグオプションが正しく指定されている |
| `--help=true --version` | NG | 一部のフラグオプションに値が指定されている（エラー） |

2. **ValueOption（値を持つオプション）**
```typescript
// 値を持つオプションの評価結果
const valueResult: ValidationResult = {
  isValid: true,  // 値が正しく指定されている
  errors: []      // エラーなし
};
```
- 値の存在チェック（必須の場合）
- 値の形式チェック
- カスタムバリデーションの実行

3. **CustomVariableOption（カスタム変数オプション）**
```typescript
// カスタム変数オプションの評価結果
const customResult: ValidationResult = {
  isValid: true,  // 変数名が正しい形式
  errors: []      // エラーなし
};
```
- 変数名の形式チェック
- 値の検証は行わない
- パターンマッチングの結果に基づく評価

#### 2.5.3 評価の使用例

```typescript
// オプションの評価結果の使用
const option = new ValueOption('from', ['f'], true, 'Input file', (v) => ({
  isValid: v.length > 0,
  errors: v.length === 0 ? ['Value cannot be empty'] : []
}));

const result = option.validate('input.md');
if (result.isValid) {
  // オプションが有効な場合の処理
  console.log('Option is valid');
} else {
  // エラー処理
  console.error(result.errors.join(', '));
}
```

#### 2.5.4 評価結果の解釈

1. **成功ケース**
   - `isValid: true` は、オプションが正しく指定され、必要な検証を通過したことを示す
   - エラーメッセージは空配列
   - オプションの値は使用可能
   - フラグオプションの場合は、値の有無に関わらず存在のみで有効

2. **失敗ケース**
   - `isValid: false` は、オプションの指定に問題があることを示す
   - エラーメッセージに具体的な問題が記載される
   - オプションの値は使用不可
   - フラグオプションに値が指定された場合は `"Invalid option format"` エラー

3. **必須オプション**
   - 必須オプションが指定されていない場合、`isValid: false`
   - エラーメッセージに「必須」である旨が記載される

4. **オプションの組み合わせ**
   - 複数のオプションが指定された場合、それぞれ独立して評価
   - すべてのオプションが `isValid: true` の場合のみ、全体として有効
   - フラグオプションは値を持たず、存在のみで評価

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