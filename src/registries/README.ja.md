# オプションレジストリ

オプションレジストリは、コマンドラインオプションの登録と管理を行うコンポーネントです。

## 概要

オプションレジストリは以下の機能を提供します：

- オプションの登録と取得
- エイリアス（短縮形）の管理
- コマンドライン引数からのオプション抽出
- カスタム変数オプションのサポート

> 注意: バリデーションは `/validator` ディレクトリの別コンポーネントで行われます。このレジストリはオプションの管理のみを担当します。

## インターフェース

```typescript
interface OptionRegistry {
  register(option: Option): void;
  get(name: string): Option | undefined;
  getAll(): Option[];
  extractOptions(args: string[]): { name: string; value: unknown }[];
}
```

## オプションタイプ

### 1. 値を持つオプション (ValueOption)
- 値のパースを行う
- 必須オプションのサポート
- バリデーションは別コンポーネントで実行

### 2. フラグオプション (FlagOption)
- 値を持たないオプション
- 存在するかどうかのみを管理
- 常に有効なオプションとして扱う

### 3. カスタム変数オプション (CustomVariableOption)
- `--uv-*` 形式のカスタム変数
- 変数名のパターン検証
- 任意の値を受け入れる

## 使用例

### 基本的な使用
```typescript
const registry = new CommandLineOptionRegistry();

// フラグオプションの登録
const flagOption = new FlagOption('--help', ['-h'], 'Show help message');
registry.register(flagOption);

// 値を持つオプションの登録
const valueOption = new ValueOption(
  '--input',
  ['-i'],
  true,
  'Input file path',
  (value) => ({ isValid: true, validatedParams: [] }) // バリデーションは別コンポーネントで実行
);
registry.register(valueOption);

// カスタム変数オプションの登録
const customOption = new CustomVariableOption('--uv-config', 'Configuration file');
registry.register(customOption);

// オプションの取得
const option = registry.get('--help');
```

### コマンドライン引数からの抽出
```typescript
const args = ['--input=value', '--help', '--uv-custom=123'];
const extracted = registry.extractOptions(args);
```

## オプション管理

オプションの管理は以下のルールに従います：

1. オプションの登録
   - 各オプションは適切なクラスのインスタンスとして登録
   - エイリアスがある場合は、同じオプションインスタンスがエイリアス名でも登録

2. オプションの取得
   - 名前またはエイリアスでオプションを取得可能
   - 存在しないオプションの場合は `undefined` を返す

3. オプションの抽出
   - コマンドライン引数から `--key=value` 形式のオプションを抽出
   - 値がない場合は `true` を設定

## エラー処理

オプションの抽出エラーは以下の形式で返されます：

```typescript
interface ValidationResult {
  isValid: boolean;
  validatedParams: unknown[];
  errorMessage?: string;
}
```

エラーケース：
- 無効なオプション形式
- 未知のオプション
- 必須オプションの欠落 