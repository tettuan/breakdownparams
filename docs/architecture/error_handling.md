# エラー制御アーキテクチャ設計書

## 1. 設計の目的

### 1.1 背景
- 複数のパーサー（ZeroParamsParser, OneParamParser, TwoParamsParser, CustomVariableParser）が存在
- 各パーサーで異なるエラー処理が実装されている
- エラー情報の伝播と処理が一貫していない

### 1.2 目標
- 一貫性のあるエラー処理の実現
- エラー情報の適切な伝播
- テスト容易性の向上
- デバッグ効率の改善
- ユーザー体験の向上

## 2. アーキテクチャ概要

### 2.1 エラー制御の階層構造
```
Application Layer
    │
    ├── Error Handler
    │       │
    │       ├── Error Display
    │       ├── Error Logging
    │       └── Error Notification
    │
Domain Layer
    │
    ├── Error Factory
    │       │
    │       ├── Domain Error Factory
    │       └── Infrastructure Error Factory
    │
    └── Error Types
            │
            ├── Domain Errors
            └── Infrastructure Errors
```

### 2.2 エラー情報の流れ
```
[Error Source] → [Error Factory] → [Error Handler] → [User Interface]
     │               │                   │
     └───────────────┴───────────────────┘
           Error Context Propagation
```

## 3. コアコンポーネント

### 3.1 エラー型の定義
```typescript
// 基本エラー型
interface BaseError {
  type: ErrorType;
  code: ErrorCode;
  message: string;
  context: ErrorContext;
}

// ドメインエラー
interface DomainError extends BaseError {
  type: 'DOMAIN_ERROR';
  domain: DomainType;
  validation?: ValidationContext;
}

// インフラストラクチャエラー
interface InfrastructureError extends BaseError {
  type: 'INFRASTRUCTURE_ERROR';
  infrastructure: InfrastructureType;
  technical?: TechnicalContext;
}

// エラーコンテキスト
interface ErrorContext {
  timestamp: Date;
  stack?: string;
  source: string;
  additionalInfo?: Record<string, unknown>;
}
```

### 3.2 エラーファクトリー
```typescript
class ErrorFactory {
  // ドメインエラーの生成
  static createDomainError(
    code: DomainErrorCode,
    context: DomainErrorContext
  ): DomainError;

  // インフラストラクチャエラーの生成
  static createInfrastructureError(
    code: InfrastructureErrorCode,
    context: InfrastructureErrorContext
  ): InfrastructureError;

  // エラーメッセージのフォーマット
  private static formatMessage(
    template: string,
    context: Record<string, unknown>
  ): string;
}
```

### 3.3 エラーハンドラー
```typescript
class ErrorHandler {
  // エラーの処理
  static handle(error: BaseError): void;

  // エラーの表示
  private static displayError(error: BaseError): void;

  // エラーのログ記録
  private static logError(error: BaseError): void;

  // エラー通知の送信
  private static notifyError(error: BaseError): void;
}
```

## 4. エラー処理パターン

### 4.1 Result型パターン
```typescript
interface Result<T, E extends BaseError> {
  success: boolean;
  data?: T;
  error?: E;
}

// 使用例
function processCommand(args: string[]): Result<Command, ParseError> {
  try {
    const command = parse(args);
    return { success: true, data: command };
  } catch (error) {
    return {
      success: false,
      error: ErrorFactory.createDomainError('PARSE_ERROR', {
        args,
        originalError: error
      })
    };
  }
}
```

### 4.2 Either型パターン
```typescript
type Either<L, R> = Left<L> | Right<R>;

class Left<L> {
  constructor(readonly value: L) {}
  isLeft(): this is Left<L> { return true; }
  isRight(): this is Right<never> { return false; }
}

class Right<R> {
  constructor(readonly value: R) {}
  isLeft(): this is Left<never> { return false; }
  isRight(): this is Right<R> { return true; }
}
```

## 5. テスト戦略

### 5.1 テストヘルパー
```typescript
// エラーアサーション
function assertError<T, E extends BaseError>(
  result: Result<T, E>,
  expectedError: Partial<E>
): void;

// エラーコンテキストアサーション
function assertErrorContext<E extends BaseError>(
  error: E,
  expectedContext: Partial<E['context']>
): void;
```

### 5.2 テストケース
```typescript
Deno.test('should handle parse error', () => {
  const result = processCommand(['--invalid']);
  assertError(result, {
    type: 'DOMAIN_ERROR',
    code: 'PARSE_ERROR'
  });
  assertErrorContext(result.error, {
    source: 'CommandParser',
    args: ['--invalid']
  });
});
```

## 6. 実装ガイドライン

### 6.1 エラーコードの定義
```typescript
const ERROR_CODES = {
  DOMAIN: {
    PARSE_ERROR: 'PARSE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    // ...
  },
  INFRASTRUCTURE: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    // ...
  }
} as const;
```

### 6.2 エラーメッセージの定義
```typescript
const ERROR_MESSAGES = {
  [ERROR_CODES.DOMAIN.PARSE_ERROR]: 'Failed to parse command: {command}',
  [ERROR_CODES.DOMAIN.VALIDATION_ERROR]: 'Invalid command: {reason}',
  // ...
} as const;
```

## 7. ベストプラクティス

### 7.1 エラー情報の不変性
- エラーオブジェクトは作成後に変更不可
- エラー情報の追加は新しいエラーオブジェクトの作成を通じて

### 7.2 エラー変換の一貫性
- 下位層のエラーを上位層のエラーに変換する際のルールを統一
- エラー情報の損失を最小限に

### 7.3 エラーログの構造化
- エラー情報を構造化された形式でログに記録
- デバッグに必要な情報を確実に保持

### 7.4 エラーメッセージの国際化
- エラーメッセージのテンプレート化
- 多言語対応の考慮

## 8. 期待される効果

### 8.1 保守性
- エラー処理の一貫性
- テストの容易さ
- コードの可読性

### 8.2 拡張性
- 新しいエラー型の追加が容易
- エラー処理の戦略の変更が容易
- 多言語対応の実装が容易

### 8.3 デバッグ性
- エラー情報の完全性
- エラーコンテキストの明確さ
- スタックトレースの活用

### 8.4 ユーザー体験
- 適切なエラーメッセージ
- エラー情報の階層的な表示
- エラー回復のガイダンス

