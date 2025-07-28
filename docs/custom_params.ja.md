# カスタム設定仕様

このドキュメントは、breakdownparamsライブラリのカスタム設定機能の仕様を定義します。

## 1. 概要

カスタム設定機能は、パラメータのバリデーションルール、オプションの定義、およびそれらの組み合わせルールを設定可能にする機能です。
デフォルトの設定値を使用することで、標準的な使用パターンをサポートしつつ、必要に応じてカスタムな設定を適用することができます。

## 2. 設定可能な項目

### 2.1 パラメータ設定

1. **DirectiveType**
   - デフォルトパターン：`^(to|summary|defect)$`
   - カスタムパターン：設定値で指定
   - 許可される値のリスト

2. **LayerType**
   - デフォルトパターン：`^(project|issue|task)$`
   - カスタムパターン：設定値で指定
   - 許可される値のリスト

### 2.2 オプション設定

1. **フラグオプション**
   - help, version などのboolean型オプション
   - 短縮形の定義

2. **値オプション**
   - from, destination, input, adaptation, config などの値を持つオプション
   - 短縮形の定義

3. **カスタム変数**
   - `--uv-*` 形式のユーザー定義変数
   - パターンと許可されるモードの定義

### 2.3 バリデーションルール

各パラメータモード（zero/one/two）ごとに：
- 許可されるオプションのリスト
- カスタム変数の許可/不許可

## 3. 設定値

### 3.1 設定値の構造

```typescript
interface CustomConfig {
  // パラメータ設定
  params: {
    two: {
      directiveType: {
        pattern: string;
        errorMessage: string;
      };
      layerType: {
        pattern: string;
        errorMessage: string;
      };
    };
  };
  
  // オプション定義
  options: {
    flags: Record<string, {
      shortForm?: string;
      description: string;
    }>;
    values: Record<string, {
      shortForm?: string;
      description: string;
      valueRequired?: boolean;
    }>;
    userVariables: {
      pattern: string;
      description: string;
    };
  };
  
  // バリデーションルール
  validation: {
    zero: ValidationRules;
    one: ValidationRules;
    two: ValidationRules;
  };
  
  // エラーハンドリング設定
  errorHandling: {
    unknownOption: 'error' | 'ignore' | 'warn';
    duplicateOption: 'error' | 'ignore' | 'warn';
    emptyValue: 'error' | 'ignore' | 'warn';
  };
}
```

### 3.2 デフォルト設定値

```typescript
const DEFAULT_CUSTOM_CONFIG: CustomConfig = {
  params: {
    two: {
      directiveType: {
        pattern: '^(to|summary|defect)$',
        errorMessage: 'Invalid directive type. Must be one of: to, summary, defect',
      },
      layerType: {
        pattern: '^(project|issue|task)$',
        errorMessage: 'Invalid layer type. Must be one of: project, issue, task',
      },
    },
  },
  options: {
    flags: {
      help: { shortForm: 'h', description: 'Display help information' },
      version: { shortForm: 'v', description: 'Display version information' },
    },
    values: {
      from: { shortForm: 'f', description: 'Source file path', valueRequired: true },
      destination: { shortForm: 'o', description: 'Output file path', valueRequired: true },
      input: { shortForm: 'i', description: 'Input layer type', valueRequired: true },
      adaptation: { shortForm: 'a', description: 'Prompt adaptation type', valueRequired: true },
      config: { shortForm: 'c', description: 'Configuration file name', valueRequired: true },
    },
    userVariables: {
      pattern: '^uv-[a-zA-Z][a-zA-Z0-9_-]*$',
      description: 'User-defined variables (--uv-*)',
    },
  },
  validation: {
    zero: {
      allowedOptions: ['help', 'version'],
      allowedValueOptions: [],
      allowUserVariables: false,
    },
    one: {
      allowedOptions: ['config'],
      allowedValueOptions: ['from', 'destination', 'input', 'adaptation'],
      allowUserVariables: false,
    },
    two: {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input'],
      allowedValueOptions: ['from', 'destination', 'input', 'adaptation', 'config'],
      allowUserVariables: true,
    },
  },
  errorHandling: {
    unknownOption: 'error',
    duplicateOption: 'error',
    emptyValue: 'error',
  },
};
```

### 3.3 カスタム設定値の例

```typescript
// カスタム設定値の例
const customConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  params: {
    two: {
      directiveType: {
        pattern: '^(to|from|for)$',  // カスタムな値を許可
        errorMessage: 'Invalid directive type. Must be one of: to, from, for',
      },
      layerType: {
        pattern: '^(module|component|service)$',  // カスタムな値を許可
        errorMessage: 'Invalid layer type. Must be one of: module, component, service',
      },
    },
  },
  validation: {
    ...DEFAULT_CUSTOM_CONFIG.validation,
    two: {
      ...DEFAULT_CUSTOM_CONFIG.validation.two,
      allowedOptions: ['from', 'destination', 'config'],  // 一部のオプションのみ許可
    },
  },
};
```

## 4. バリデーション処理

### 4.1 デフォルト設定値でのバリデーション

デフォルト設定値では、以下の値のみを許可します：

- DirectiveType: `to`, `summary`, `defect`
- LayerType: `project`, `issue`, `task`

### 4.2 カスタム設定値でのバリデーション

カスタム設定値では、設定値で指定されたパターンに一致する値を許可します：

1. **DirectiveTypeのバリデーション**
   - 設定値のパターンに一致するかチェック
   - 不一致の場合はカスタムエラーメッセージを返却

2. **LayerTypeのバリデーション**
   - 設定値のパターンに一致するかチェック
   - 不一致の場合はカスタムエラーメッセージを返却

## 5. 使用例

### 5.1 パーサーの初期化

```typescript
import { ParamsParser } from './mod.ts';

// デフォルト設定値でパーサーを初期化
const parser = new ParamsParser();

// カスタム設定値でパーサーを初期化
const customParser = new ParamsParser(undefined, undefined, customConfig);
```

### 5.2 パラメータの解析

```typescript
// デフォルト設定値での使用例
const result = parser.parse(['to', 'project', '--from=input.md']);

if (result.type === 'two') {
  console.log(result.params.directiveType); // "to"
  console.log(result.params.layerType); // "project"
  console.log(result.options.from); // "input.md"
}

// カスタム設定値での使用例
const customResult = customParser.parse(['from', 'module', '--from=src/']);

if (customResult.type === 'two') {
  console.log(customResult.params.directiveType); // "from"
  console.log(customResult.params.layerType); // "module"
  console.log(customResult.options.from); // "src/"
}
```

### 5.3 設定のベストプラクティス

#### ❌ 誤った方法: パーシャル設定（実行時エラーが発生）

```typescript
// これはやってはいけません - 必要なプロパティが欠けています
const partialConfig = {
  params: {
    two: {
      directiveType: { 
        pattern: '^(custom)$', 
        errorMessage: 'カスタムエラー' 
      }
      // layerType、validation、options、errorHandlingが欠けている
    }
  }
};

const parser = new ParamsParser(undefined, partialConfig); // 実行時エラー！
// TypeError: Cannot read properties of undefined (reading 'zero')
```

#### ✅ 正しい方法: DEFAULT_CUSTOM_CONFIGのスプレッドを使用

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, CustomConfig } from 'jsr:@tettuan/breakdownparams';

// 安全な部分的オーバーライドのためにデフォルト設定とマージ
const safeConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,  // すべてのデフォルト設定を含める
  params: {
    two: {
      directiveType: {
        pattern: '^(作成|更新|削除)$',
        errorMessage: '無効なアクション。作成、更新、削除のいずれかを指定してください'
      },
      layerType: {
        pattern: '^(ユーザー|商品|注文)$', 
        errorMessage: '無効なエンティティ。ユーザー、商品、注文のいずれかを指定してください'
      }
    }
  }
};

const parser = new ParamsParser(undefined, safeConfig); // 完璧に動作！

// カスタムパラメータが期待通りに動作
const result = parser.parse(['作成', 'ユーザー']);
// デフォルトのバリデーションルールとオプションが保持される
const resultWithOptions = parser.parse(['更新', '商品', '--from=data.json']);
```

#### 重要なポイント:

- **カスタム設定を作成する際は常に `...DEFAULT_CUSTOM_CONFIG` を使用する**
- **デフォルト値なしのパーシャル設定は実行時エラーを引き起こす**
- **カスタマイズが必要な特定の部分のみをオーバーライドする**
- **その他すべての設定（validation、options、errorHandling）はデフォルトから継承される**

## 6. エラー処理

### 6.1 エラーの種類

1. **バリデーションエラー**
   - パターン不一致
   - カスタムエラーメッセージを返却

2. **設定エラー**
   - 不正な設定値
   - パターンの構文エラー

### 6.2 エラーメッセージ

```typescript
// バリデーションエラーの例
{
  type: "error",
  params: [],
  options: {},
  error: {
    message: "Invalid directive type. Must be one of: to, summary, defect",
    code: "INVALID_DIRECTIVE_TYPE",
    category: "validation"
  }
}

// 設定エラーの例
{
  type: "error",
  params: [],
  options: {},
  error: {
    message: "Invalid configuration: pattern is required",
    code: "INVALID_CONFIGURATION",
    category: "config"
  }
}
```

## 7. 制約事項

1. **パターンの制約**
   - 正規表現として有効である必要がある
   - 複雑すぎるパターンは避ける

2. **パフォーマンス**
   - パターンは事前にコンパイルする
   - 複雑なパターンは実行時オーバーヘッド

3. **セキュリティ**
   - パターンは適切に制限する
   - ユーザー入力の直接使用は避ける

## 8. 移行ガイド

### 8.1 デフォルト設定値からカスタム設定値への移行

1. 設定値の準備
   - 必要なパターンの定義
   - エラーメッセージの準備

2. パーサーの初期化
   - カスタム設定値の適用

3. 既存コードの確認
   - エラーハンドリングの確認
   - 戻り値の型の確認

### 8.2 カスタム設定値からデフォルト設定値への移行

1. デフォルト設定値の使用
   - カスタム設定値の削除
   - デフォルト設定値の適用

2. パラメータの確認
   - デフォルト値の使用確認
   - カスタム値の置き換え

---

[日本語版](custom_params.ja.md) | [English Version](custom_params.md)
