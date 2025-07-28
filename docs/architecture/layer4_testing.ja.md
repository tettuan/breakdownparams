# テスト設計仕様

## 1. テストの概要

### 1.1 階層構造

テストは以下の3つの主要な階層に分類されます：

1. **Architectureテスト**
   - 設計の整合性を検証
   - クラス名、メソッド名、インターフェースの確認
   - 設計ドキュメントとの一貫性チェック

2. **Structureテスト**
   - 型定義、定数、構造体の検証
   - 型の整合性と安全性の確認
   - インターフェースの実装確認

3. **実装テスト**
   - 基盤機能（Fundations）
   - コア機能（Cores）
   - 単体テスト（Units）
   - 結合テスト（Integrations）
   - エンドツーエンドテスト（E2E）

### 1.2 テストの責務

#### 1.2.1 Architectureテスト

- **目的**
  - 設計の一貫性を保証
  - アーキテクチャの制約を検証
  - 設計ドキュメントとの整合性を確認

- **検証項目**
  - クラス名とメソッド名の命名規則
  - インターフェースの定義
  - コンポーネント間の関係
  - 設計原則の遵守

#### 1.2.2 Structureテスト

- **目的**
  - 型システムの整合性を保証
  - データ構造の正しさを検証
  - 型安全性を確保

- **検証項目**
  - 型定義の正確性
  - 定数の値と型
  - インターフェースの実装
  - 型の互換性

#### 1.2.3 実装テスト

- **基盤機能（Fundations）**
  - 基本的なユーティリティ関数
  - 共通コンポーネント
  - 基盤となる機能

- **コア機能（Cores）**
  - 主要なビジネスロジック
  - 中心となる機能
  - 重要な処理フロー

- **単体テスト（Units）**
  - 個々のコンポーネント
  - 独立した機能
  - 分離された処理

- **結合テスト（Integrations）**
  - コンポーネント間の連携
  - データの受け渡し
  - 統合された機能

- **エンドツーエンドテスト（E2E）**
  - 全体の処理フロー
  - ユーザーシナリオ
  - 実際の使用パターン

## 2. テスト実装

### 2.1 テストヘルパー

```typescript
interface TestCase {
  input: string[];
  expected: {
    type: 'zero' | 'one' | 'two';
    directiveType?: string;
    layerType?: string;
    options?: Record<string, string>;
    error?: ErrorInfo;
  };
}

function runTestCase(testCase: TestCase) {
  const parser = new ParamsParser();
  const result = parser.parse(testCase.input);
  assertEquals(result, testCase.expected);
}
```

### 2.2 テストデータ

```typescript
const testCases: TestCase[] = [
  {
    input: ['--help'],
    expected: {
      type: 'zero',
      options: { help: '' }
    }
  },
  {
    input: ['init'],
    expected: {
      type: 'one',
      directiveType: 'init'
    }
  },
  {
    input: ['to', 'project', '--uv-name=test'],
    expected: {
      type: 'two',
      directiveType: 'to',
      layerType: 'project',
      options: { 'uv-name': 'test' }
    }
  }
];
```

### 2.3 テスト実行

```typescript
Deno.test('ParamsParser', async (t) => {
  for (const testCase of testCases) {
    await t.step(testCase.input.join(' '), () => {
      runTestCase(testCase);
    });
  }
});
```

## 3. テストケース

### 3.1 パラメータテスト

#### 3.1.1 ZeroParamsValidator

```typescript
Deno.test('ZeroParamsValidator', async (t) => {
  await t.step('should validate empty args', () => {
    const validator = new ZeroParamValidator(DEFAULT_CONFIG);
    const result = validator.validate([]);
    assert(result.isValid);
  });

  await t.step('should validate help option', () => {
    const validator = new ZeroParamValidator(DEFAULT_CONFIG);
    const result = validator.validate(['--help']);
    assert(result.isValid);
  });

  await t.step('should reject with args', () => {
    const validator = new ZeroParamValidator(DEFAULT_CONFIG);
    const result = validator.validate(['invalid']);
    assert(!result.isValid);
  });
});
```

#### 3.1.2 OneParamValidator

```typescript
Deno.test('OneParamValidator', async (t) => {
  await t.step('should validate init command', () => {
    const validator = new OneParamValidator(DEFAULT_CONFIG);
    const result = validator.validate(['init']);
    assert(result.isValid);
  });

  await t.step('should reject invalid command', () => {
    const validator = new OneParamValidator(DEFAULT_CONFIG);
    const result = validator.validate(['invalid']);
    assert(!result.isValid);
  });
});
```

#### 3.1.3 TwoParamValidator

```typescript
Deno.test('TwoParamValidator', async (t) => {
  await t.step('should validate default values', () => {
    const validator = new TwoParamValidator(DEFAULT_CONFIG);
    const result = validator.validate(['to', 'project']);
    assert(result.isValid);
    assertEquals(result.directiveType, 'to');
    assertEquals(result.layerType, 'project');
  });

  await t.step('should validate custom values', () => {
    const customConfig = {
      directiveType: {
        pattern: '^[a-z]+$',
        errorMessage: 'Invalid directive type'
      },
      layerType: {
        pattern: '^[a-z]+$',
        errorMessage: 'Invalid layer type'
      }
    };
    const validator = new TwoParamValidator(customConfig);
    const result = validator.validate(['custom', 'layer']);
    assert(result.isValid);
    assertEquals(result.directiveType, 'custom');
    assertEquals(result.layerType, 'layer');
  });
});
```

### 3.2 オプションテスト

#### 3.2.1 OptionRegistry

```typescript
Deno.test('OptionRegistry', async (t) => {
  const registry = new OptionRegistry();

  await t.step('should register and retrieve options', () => {
    const option = new ValueOption('test', ['t'], false, 'Test option', (v) => ({ isValid: true, errors: [] }));
    registry.register(option);
    
    const retrieved = registry.get('test');
    assert(retrieved === option);
    
    const alias = registry.get('t');
    assert(alias === option);
  });

  await t.step('should validate user variables', () => {
    assert(registry.validateUserVariable('uv-test'));
    assert(!registry.validateUserVariable('invalid'));
  });

  await t.step('should get all registered options', () => {
    const options = registry.getAll();
    assert(options.length > 0);
  });
});
```

#### 3.2.2 ValueOption

```typescript
Deno.test('ValueOption', async (t) => {
  const validator = (value: string) => ({
    isValid: value.length > 0,
    errors: value.length === 0 ? ['Value cannot be empty'] : []
  });

  const option = new ValueOption('test', ['t'], true, 'Test option', validator);

  await t.step('should validate required option', () => {
    const result = option.validate(undefined);
    assert(!result.isValid);
    assert(result.errors.includes('test is required'));
  });

  await t.step('should validate value with custom validator', () => {
    const result = option.validate('');
    assert(!result.isValid);
    assert(result.errors.includes('Value cannot be empty'));

    const validResult = option.validate('valid');
    assert(validResult.isValid);
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});
```

#### 3.2.3 FlagOption

```typescript
Deno.test('FlagOption', async (t) => {
  const option = new FlagOption('test', ['t'], 'Test flag');

  await t.step('should always validate successfully', () => {
    const result = option.validate(undefined);
    assert(result.isValid);
  });

  await t.step('should parse as boolean', () => {
    const trueValue = option.parse('any');
    assert(trueValue === true);

    const falseValue = option.parse(undefined);
    assert(falseValue === false);
  });
});
```

#### 3.2.4 UserVariableOption

```typescript
Deno.test('UserVariableOption', async (t) => {
  const pattern = /^uv-[a-zA-Z0-9_]+$/;
  const option = new UserVariableOption('uv-test', 'Test variable', pattern);

  await t.step('should validate name pattern', () => {
    const result = option.validate('value');
    assert(result.isValid);
  });

  await t.step('should reject invalid name pattern', () => {
    const invalidOption = new UserVariableOption('invalid', 'Invalid', pattern);
    const result = invalidOption.validate('value');
    assert(!result.isValid);
    assert(result.errors.includes('Invalid user variable name: invalid'));
  });

  await t.step('should parse value', () => {
    const value = option.parse('test');
    assertEquals(value, 'test');
  });
});
```

#### 3.2.5 OptionsValidator

```typescript
Deno.test('OptionsValidator', async (t) => {
  const registry = new OptionRegistry();
  const validator = new OptionsValidator();

  await t.step('should validate registered options', () => {
    const option = new ValueOption('test', ['t'], false, 'Test option', (v) => ({ isValid: true, errors: [] }));
    registry.register(option);

    const result = validator.validate(['--test=value'], registry);
    assert(result.isValid);
  });

  await t.step('should validate user variables', () => {
    const result = validator.validate(['--uv-name=test'], registry);
    assert(result.isValid);
  });

  await t.step('should reject invalid user variables', () => {
    const result = validator.validate(['--invalid-name=test'], registry);
    assert(!result.isValid);
  });

  await t.step('should reject invalid option values', () => {
    const option = new ValueOption('test', ['t'], false, 'Test option', 
      (v) => ({ isValid: false, errors: ['Invalid value'] }));
    registry.register(option);

    const result = validator.validate(['--test=invalid'], registry);
    assert(!result.isValid);
  });
});
```

### 3.3 エラーテスト

```typescript
Deno.test('OptionError', async (t) => {
  await t.step('should create option error', () => {
    const error = ErrorFactory.createOptionError('test', 'Invalid option');
    assertEquals(error.code, 'INVALID_OPTION');
    assertEquals(error.details?.option, 'test');
  });

  await t.step('should handle option validation errors', () => {
    const option = new ValueOption('test', ['t'], true, 'Test option', 
      (v) => ({ isValid: false, errors: ['Invalid value'] }));
    
    const result = option.validate('invalid');
    assert(!result.isValid);
    assert(result.errors.includes('Invalid value'));
  });
});
```

## 4. テスト環境

### 4.1 開発環境
- Deno
- TypeScript
- テストフレームワーク

### 4.2 CI/CD環境
- GitHub Actions
- テスト自動化
- レポート生成

## 5. テスト品質

### 5.1 カバレッジ
- コードカバレッジ
- 機能カバレッジ
- エッジケース

## 6. テストメンテナンス

### 6.1 テスト更新
- 機能追加時の更新
- バグ修正時の更新
- リファクタリング時の更新

---

[日本語版](layer4_testing.ja.md) | [English Version](layer4_testing.md) 