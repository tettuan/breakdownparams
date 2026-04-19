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
   - from, destination, edition, adaptation, config などの値を持つオプション
   - 短縮形の定義

3. **カスタム変数**
   - `--uv-*` 形式のユーザー定義変数
   - パターンと許可されるモードの定義

### 2.3 バリデーションルール

各パラメータモード（zero/one/two）ごとに：
- 許可されるオプションのリスト（`validation.{zero,one,two}.allowedOptions`）
- カスタム変数の許可/不許可

#### `validation.{zero,one,two}.allowedOptions` のセマンティクス

- このリストは、該当パラメータモードに対する `OptionValidator`
  （`ZeroOptionValidator` / `OneOptionValidator` / `TwoOptionValidator`）が許可と判定する正規オプション名の一覧を定義します。
- このリストはデフォルトを **置換** します。**追加（追記）ではありません**。利用者がここに書いたものがそのまま OptionValidator の許可リストになります。デフォルトに追加したい場合は、`DEFAULT_CUSTOM_CONFIG.validation.{mode}.allowedOptions` をスプレッドした上で要素を追記してください。
- `ParamsParser` は OptionValidator を生成する際に `CustomConfig` を注入するため、ここで設定した値が各モードで受理されるオプションを直接決定します。

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
      kind?: ValueKind;              // 'path' | 'text'。既定 'text'
      securityPolicy?: SecurityPolicy; // オプション単位オーバーライド
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

  // セキュリティポリシー（任意。省略時は { policy: 'safe' } として扱う）
  security?: {
    policy: SecurityPolicy;
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
      from: { shortForm: 'f', description: 'Source file path', valueRequired: true, kind: 'path' },
      destination: { shortForm: 'o', description: 'Output file path', valueRequired: true, kind: 'path' },
      input: { shortForm: 'i', description: 'Input layer type', valueRequired: true, kind: 'text' },
      adaptation: { shortForm: 'a', description: 'Prompt adaptation type', valueRequired: true, kind: 'text' },
      config: { shortForm: 'c', description: 'Configuration file name', valueRequired: true, kind: 'text' },
      edition: { shortForm: 'e', description: 'Input layer type', valueRequired: true, kind: 'text' },
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
      allowedValueOptions: ['from', 'destination', 'edition', 'adaptation'],
      allowUserVariables: false,
    },
    two: {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'edition'],
      allowedValueOptions: ['from', 'destination', 'edition', 'adaptation', 'config'],
      allowUserVariables: true,
    },
  },
  errorHandling: {
    unknownOption: 'error',
    duplicateOption: 'error',
    emptyValue: 'error',
  },
  security: {
    policy: 'safe',
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

## 8. セキュリティポリシー

`security` フィールドはパーサー組み込みのパス / シェルインジェクション検査を制御します。動作詳細とカテゴリ × レベルの全マトリクスは [セキュリティ検査](development.ja.md#セキュリティ検査) にあります。本節は公開型と利用者の組み込み方を説明します。

### 8.1 型

```typescript
// カテゴリごとの強度。
type Level = 'off' | 'safe' | 'strict';

// 5 つの組み込みカテゴリ。shellInjection は全引数対象。残り 4 つは
// kind が 'path' の value option のみに適用。
type SecurityCategory =
  | 'shellInjection'
  | 'absolutePath'
  | 'homeExpansion'
  | 'parentTraversal'
  | 'specialChars';

// 部分マップ。未指定キーは外側のレベルにフォールバック。
type SecurityCategoryLevels = Partial<Record<SecurityCategory, Level>>;

// 単一 Level は「全カテゴリに同レベル適用」のショートハンド。
// 部分マップは個別調整用。
type SecurityPolicy = Level | SecurityCategoryLevels;

// value option の値解釈方法を分類。'path' を指定すると
// 4 つのパス系カテゴリの対象になる。'text'（既定）は Phase 1 の
// shellInjection だけが適用される。
type ValueKind = 'path' | 'text';
```

これら 4 つの型はパッケージのエントリポイントから `CustomConfig` / `DEFAULT_CUSTOM_CONFIG` と並んで再エクスポートされます。

### 8.2 利用者定義 value option（`kind` の落とし穴）

利用者が登録する value option は既定で `kind: 'text'` です。**結果として**、独自に追加したパス値オプションには明示的に `kind: 'path'` を指定しない限り、パストラバーサル / 絶対パス / ホーム展開 / 制御文字の各検査は **適用されません**。

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

// 落とし穴: --workspace は kind 既定 'text' のため ../etc が素通りする。
const looseConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      workspace: {
        shortForm: 'w',
        description: 'Workspace directory',
        valueRequired: true,
        // kind 省略 → 'text' → パス検査なし
      },
    },
  },
};

// 修正後: kind: 'path' を宣言して Phase 2 の 4 カテゴリを適用。
const safeConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      workspace: {
        shortForm: 'w',
        description: 'Workspace directory',
        valueRequired: true,
        kind: 'path',
      },
    },
  },
};
```

### 8.3 オプション単位オーバーライド

オプション単位の `securityPolicy` は指定したカテゴリのみを上書きし、それ以外はグローバルポリシーを継承します。さらに当該オプションの `kind` による制約も働き、`kind: 'text'` のオプションではパス系カテゴリは強制的に `'off'` です。

注: `shellInjection` はオプション単位で緩められません。Phase 1 はオプション識別が無い段階で走るため、特定オプションへの `shellInjection` オーバーライドは効きません。

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

const config: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      from: {
        ...DEFAULT_CUSTOM_CONFIG.options.values.from,
        // --from に限り ~/x と /abs/x を許可。parentTraversal は 'safe' のまま。
        securityPolicy: {
          absolutePath: 'off',
          homeExpansion: 'off',
        },
      },
    },
  },
};

const parser = new ParamsParser(undefined, config);
```

### 8.4 グローバル strict

グローバルポリシーを `'strict'` に上げると、全カテゴリのパターン集合が拡張されます。`shellInjection` は `` ` ``, `$`, 改行, `$( )` も拒否、`parentTraversal` は URL エンコード `%2e%2e` にも反応、といった具合です。

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

const strictConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  security: {
    policy: 'strict',
  },
};

const parser = new ParamsParser(undefined, strictConfig);
```

### 8.5 `from` / `destination` を v1.2.x 互換に戻す

v1.3.0 以前は `--from=/abs/path` と `--from=~/data` を受け入れていました（パーサーがグローバルな `parentTraversal` 検査しかしていなかったため）。v1.3.0 の既定 `'safe'` は両者を拒否します。旧来の挙動が必要な利用者は、対象オプションで新規施行された 2 カテゴリだけを無効化できます。

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

const v12CompatConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      from: {
        ...DEFAULT_CUSTOM_CONFIG.options.values.from,
        securityPolicy: {
          absolutePath: 'off',
          homeExpansion: 'off',
        },
      },
      destination: {
        ...DEFAULT_CUSTOM_CONFIG.options.values.destination,
        securityPolicy: {
          absolutePath: 'off',
          homeExpansion: 'off',
        },
      },
    },
  },
};
```

`parentTraversal` / `specialChars` / グローバル `shellInjection` は `'safe'` のまま残します（前者は元から検査されており、`specialChars` は新規ですが望ましい挙動です）。v1.2.x 互換のために緩める必要はありません。

## 9. 移行ガイド

### 9.1 デフォルト設定値からカスタム設定値への移行

1. 設定値の準備
   - 必要なパターンの定義
   - エラーメッセージの準備

2. パーサーの初期化
   - カスタム設定値の適用

3. 既存コードの確認
   - エラーハンドリングの確認
   - 戻り値の型の確認

### 9.2 カスタム設定値からデフォルト設定値への移行

1. デフォルト設定値の使用
   - カスタム設定値の削除
   - デフォルト設定値の適用

2. パラメータの確認
   - デフォルト値の使用確認
   - カスタム値の置き換え

---

[日本語版](custom_params.ja.md) | [English Version](custom_params.md)
