「仕様理解」を行ったあと、「ParamsParserのrefactor」する。
ミッション完了に向けて、再帰的に実行すること。

# ミッション
ParamsParserのrefactor完了

# 仕様理解

まず、用語集 `docs/glossary.md` で関係性を把握して。
`docs/params.md`, `params_type.md` は必読。
必要に応じ、`docs/index.md` から参照される仕様書を読む。

- Chat: 日本語、 Codebase: English


# ParamsParserのrefactor

以下の分割を行い、完了まで再帰的にリファクタを続ける。

- テスト駆動でテストを作成
- その後、実装を変更

# ParamsParser リファクタリング提案

## 1. 責務の分離

### 1.1 設定バリデーションの分離
```typescript
// 現在: ParamsParser クラス内に直接実装
if (this.config.isExtendedMode) {
  // 設定バリデーションのロジック
}

// 提案: 専用のクラスに分離
class ConfigValidator {
  validate(config: ParserConfig): ErrorResult | null {
    // 設定バリデーションのロジック
  }
}
```

### 1.2 セキュリティチェックの分離
```typescript
// 現在: ParamsParser クラス内に直接実装
const forbiddenChars = [';', '&', '`'];
// セキュリティチェックのロジック

// 提案: 専用のクラスに分離
class SecurityValidator {
  private readonly forbiddenChars = [';', '&', '`'];
  validatePattern(pattern: string): ErrorResult | null {
    // セキュリティチェックのロジック
  }
}
```

## 2. エラーハンドリングの改善

### 2.1 エラー生成の一元化
```typescript
// 現在: 各所で直接エラーオブジェクトを作成
return {
  type: 'two',
  error: {
    message: '...',
    code: ErrorCode.INVALID_CONFIG,
    // ...
  }
};

// 提案: エラーファクトリーの導入
class ErrorFactory {
  static createConfigError(message: string, details?: any): ErrorResult {
    return {
      message,
      code: ErrorCode.INVALID_CONFIG,
      category: ErrorCategory.CONFIGURATION,
      details
    };
  }
}
```

### 2.2 エラーメッセージの外部化
```typescript
// 提案: エラーメッセージを定数として定義
const ERROR_MESSAGES = {
  INVALID_CONFIG: 'Invalid configuration: pattern is required in extended mode',
  SECURITY_ERROR: 'Security error: character \'{char}\' is not allowed in pattern',
  // ...
} as const;
```

## 3. 型安全性の向上

### 3.1 定数の型定義
```typescript
// 現在: 直接 Set を使用
private readonly demonstrativeTypes = new Set<DemonstrativeType>([
  'to',
  'summary',
  'defect',
]);

// 提案: 定数として定義し、型を明示
const DEMONSTRATIVE_TYPES = ['to', 'summary', 'defect'] as const;
type DemonstrativeType = typeof DEMONSTRATIVE_TYPES[number];
```

### 3.2 結果型の改善
```typescript
// 提案: より厳密な型定義
type ParseResult<T extends ParamsResult> = T & {
  error?: ErrorResult;
};
```

## 4. テスト容易性の向上

### 4.1 依存性の注入
```typescript
// 現在: 直接インスタンス化
constructor(config?: ParserConfig) {
  this.zeroParamsParser = new ZeroParamsParser();
  // ...
}

// 提案: 依存性の注入
constructor(
  config?: ParserConfig,
  private readonly zeroParamsParser: ZeroParamsParser,
  private readonly oneParamParser: OneParamParser,
  // ...
) {}
```

### 4.2 メソッドの分割
```typescript
// 提案: 大きなメソッドを小さな単位に分割
private validateExtendedModeConfig(): ErrorResult | null {
  // 設定バリデーション
}

private validateSecurityPatterns(): ErrorResult | null {
  // セキュリティチェック
}

private parseNonOptionArgs(args: string[]): string[] {
  // 非オプション引数の解析
}
```

## 5. パフォーマンスの改善

### 5.1 正規表現の最適化
```typescript
// 現在: 毎回新しい RegExp インスタンスを作成
new RegExp(this.config.demonstrativeType.pattern);

// 提案: キャッシュの導入
private readonly patternCache = new Map<string, RegExp>();
private getPattern(pattern: string): RegExp {
  if (!this.patternCache.has(pattern)) {
    this.patternCache.set(pattern, new RegExp(pattern));
  }
  return this.patternCache.get(pattern)!;
}
```

### 5.2 早期リターンの活用
```typescript
// 提案: 条件チェックの順序最適化
if (!this.config.isExtendedMode) {
  return this.parseNormalMode(args);
}
if (!this.validateExtendedModeConfig()) {
  return this.createErrorResult();
}
```

## 6. ドキュメンテーションの改善

### 6.1 JSDoc の充実
```typescript
/**
 * コマンドライン引数を解析し、型安全な結果を返す
 * 
 * @param args - 解析するコマンドライン引数の配列
 * @returns 解析結果。エラーが発生した場合は error プロパティにエラー情報が含まれる
 * @throws {Error} 予期しないエラーが発生した場合
 */
public parse(args: string[]): ParamsResult {
  // ...
}
```

### 6.2 エラーケースのドキュメント化
```typescript
/**
 * 発生する可能性のあるエラー
 * 
 * @error INVALID_CONFIG - 設定が無効な場合
 * @error SECURITY_ERROR - セキュリティチェックに失敗した場合
 * @error TOO_MANY_ARGUMENTS - 引数が多すぎる場合
 */
```

## 7. 実装の優先順位

1. エラーハンドリングの改善
   - エラーファクトリーの導入
   - エラーメッセージの外部化

2. 責務の分離
   - 設定バリデーションの分離
   - セキュリティチェックの分離

3. 型安全性の向上
   - 定数の型定義
   - 結果型の改善

4. テスト容易性の向上
   - 依存性の注入
   - メソッドの分割

5. パフォーマンスの改善
   - 正規表現の最適化
   - 早期リターンの活用

6. ドキュメンテーションの改善
   - JSDoc の充実
   - エラーケースのドキュメント化 