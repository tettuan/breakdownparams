# オプションファクトリ

オプションファクトリは、コマンドラインオプションの生成と管理を行うコンポーネントです。

## オプションクラス中心設計における役割

新しい設計では、OptionFactoryはシステムの中核として以下の重要な役割を担います：

- **Optionインスタンスの生成**: コマンドライン引数から適切なOptionクラスのインスタンスを生成
- **オプションタイプの判定**: ValueOption、FlagOption、CustomVariableOptionの適切な選択
- **正規化の委譲**: 各Optionインスタンスが自身の正規化を担当

## 概要

オプションファクトリは以下の機能を提供します：

- Optionインスタンスの生成と管理
- 標準オプションの定義とエイリアス管理
- コマンドライン引数の解析とオプションタイプ判定
- ユーザー変数オプションのサポート

> 注意: 各Optionインスタンスが自身の正規化とバリデーションを担当します。OptionFactoryは適切なOptionクラスのインスタンス生成のみを担当します。

## 標準オプション

標準オプションは `STANDARD_OPTIONS` として定義され、以下の形式で管理されます：

```typescript
const STANDARD_OPTIONS = {
  help: {
    longname: 'help', // 長い名前 (--help)
    shortname: 'h', // 短い名前 (-h)
    type: 'flag', // オプションタイプ ("flag" | "value")
  },
  // ... その他のオプション
} as const;
```

### 標準オプションの一覧

| オプション名 | 長い名前      | 短い名前 | タイプ | 説明                   |
| ------------ | ------------- | -------- | ------ | ---------------------- |
| help         | --help        | -h       | flag   | ヘルプメッセージを表示 |
| version      | --version     | -v       | flag   | バージョン情報を表示   |
| from         | --from        | -f       | value  | 入力元を指定           |
| destination  | --destination | -o       | value  | 出力先を指定           |
| input        | --input       | -i       | value  | 入力ファイルを指定     |
| adaptation   | --adaptation  | -a       | value  | 適応設定を指定         |
| config       | --config      | -c       | value  | 設定ファイルを指定     |

## インターフェース

```typescript
interface OptionFactory {
  createOptionsFromArgs(args: string[]): Option[];
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

### 3. ユーザー変数オプション (CustomVariableOption)

- `--uv-*` 形式のユーザー変数
- 正規化： `--uv-config` → `uv-config`
- 変数名のパターン検証を自身で実装

## 使用例

### 基本的な使用

```typescript
const factory = new OptionFactory();

// コマンドライン引数からのOptionインスタンス生成
const args = ['--help', '-i=value', '--uv-config=config.json'];
const options = factory.createOptions(args);

// 生成されたOptionインスタンスの使用
options.forEach((option) => {
  console.log(option.canonicalName); // 'help', 'input', 'uv-config'
  console.log(option.validate()); // バリデーション結果
  console.log(option.getValue()); // 値の取得
});
```

### 正規化の例

```typescript
const factory = new OptionFactory();

// ショートオプション
const helpShort = factory.createOptions(['-h'])[0];
console.log(helpShort.canonicalName); // 'help'

// ロングオプション
const helpLong = factory.createOptions(['--help'])[0];
console.log(helpLong.canonicalName); // 'help'

// ユーザー変数オプション
const userVar = factory.createOptions(['--uv-project=test'])[0];
console.log(userVar.canonicalName); // 'uv-project'
```

### Optionクラスの活用

```typescript
const factory = new OptionFactory();
const options = factory.createOptions(['to', 'project', '-h', '--uv-name=test']);

// Optionインスタンスの分類
const positionalArgs = options.filter(opt => !opt.isOption());
const optionArgs = options.filter(opt => opt.isOption());

// 正規化された値の取得
const normalizedOptions = {};
optionArgs.forEach(opt => {
  normalizedOptions[opt.canonicalName] = opt.getValue();
});
// 結果: { help: true, 'uv-name': 'test' }
```

## エラー処理

オプションの生成エラーは以下のケースで発生します：

1. 未知のオプション

```typescript
// エラー: Unknown option: --unknown
factory.createOptionsFromArgs(['--unknown']);
```

2. 値が必要なオプションに値が指定されていない

```typescript
// エラー: Option --input requires a value
factory.createOptionsFromArgs(['--input']);
```

## テスト

オプションファクトリのテストは以下の3つのレベルで実装されています：

1. アーキテクチャテスト (`0_architecture_option_factory_test.ts`)
   - 基本的な機能のテスト
   - 標準オプションの動作確認

2. 構造テスト (`1_structure_option_factory_test.ts`)
   - 各オプションタイプの詳細なテスト
   - エイリアスの動作確認
   - エラーケースのテスト

3. ユニットテスト (`2_unit_option_factory_test.ts`)
   - 個々の機能のテスト
   - エッジケースのテスト
   - エラー処理のテスト
