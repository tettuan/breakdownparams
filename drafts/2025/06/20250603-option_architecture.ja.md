# オプションアーキテクチャ設計

## 1. 概要

このドキュメントは、breakdownparamsライブラリのオプション処理システムのアーキテクチャ設計を定義します。オプション処理を独立したコンポーネントとして設計し、パラメータ処理との疎結合を実現します。

## 2. コアコンポーネント

### 2.1 Option インターフェース

```typescript
interface Option {
  // オプションの基本情報
  readonly name: string;           // 長形式名 (例: "from")
  readonly aliases: string[];      // 短縮形の配列 (例: ["f"])
  readonly type: OptionType;       // オプションの種類
  readonly isRequired: boolean;    // 必須かどうか
  readonly description: string;    // 説明文

  // バリデーション
  validate(value: string | undefined): ValidationResult;
  
  // 値の変換
  parse(value: string | undefined): OptionValue;
}

enum OptionType {
  VALUE,           // 値を持つオプション (--from=value)
  FLAG,            // フラグオプション (--help)
  CUSTOM_VARIABLE  // カスタム変数オプション (--uv-*)
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

type OptionValue = string | boolean | undefined;
```

### 2.2 OptionRegistry

```typescript
class OptionRegistry {
  private options: Map<string, Option>;
  private customVariablePattern: RegExp;

  // オプションの登録
  register(option: Option): void;
  
  // オプションの取得
  get(name: string): Option | undefined;
  
  // カスタム変数オプションの検証
  validateCustomVariable(name: string): boolean;
  
  // 全オプションの取得
  getAll(): Option[];
}
```

### 2.3 OptionParser

```typescript
class OptionParser {
  constructor(private registry: OptionRegistry) {}

  // CLI引数からオプションを解析
  parse(args: string[]): ParsedOptions;
  
  // オプション値の検証
  validate(options: ParsedOptions): ValidationResult;
}

interface ParsedOptions {
  options: Map<string, OptionValue>;
  customVariables: Map<string, string>;
  errors: string[];
}
```

## 3. オプションの種類と実装

### 3.1 値を持つオプション

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

### 3.2 フラグオプション

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

### 3.3 カスタム変数オプション

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

## 4. 使用例

### 4.1 オプションの登録

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

### 4.2 オプションの解析

```typescript
const parser = new OptionParser(registry);

const result = parser.parse([
  "--from=input.md",
  "-h",
  "--uv-project=myproject"
]);

// 結果の使用
if (result.errors.length === 0) {
  const fromFile = result.options.get("from");
  const showHelp = result.options.get("help");
  const projectName = result.customVariables.get("uv-project");
}
```

## 5. 設計の特徴

1. **独立性**
   - オプション処理はパラメータ処理から完全に独立
   - 各オプションは自己完結的なバリデーションとパース処理を持つ

2. **拡張性**
   - 新しいオプションタイプの追加が容易
   - カスタムバリデーションルールの実装が可能

3. **型安全性**
   - TypeScriptの型システムを活用
   - コンパイル時のエラーチェックが可能

4. **柔軟性**
   - オプションの登録と解析を動的に行える
   - カスタム変数オプションの柔軟な定義が可能

## 6. エラーハンドリング

1. **バリデーションエラー**
   - 各オプションが独自のバリデーションルールを持つ
   - エラーメッセージは具体的で分かりやすい

2. **構文エラー**
   - 不正なオプション形式の検出
   - カスタム変数名のパターンマッチング

3. **必須オプション**
   - 必須オプションの欠落チェック
   - エラーメッセージでの明確な指示

## 7. 今後の拡張性

1. **新しいオプションタイプ**
   - 複数値オプション
   - 列挙型オプション
   - 数値範囲オプション

2. **バリデーション強化**
   - 相互依存するオプションの検証
   - 条件付きバリデーション

3. **パフォーマンス最適化**
   - オプション解析のキャッシュ
   - 並列バリデーション 