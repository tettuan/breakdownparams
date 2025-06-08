# オプションファクトリ

オプションファクトリは、コマンドラインオプションの生成と管理を行うコンポーネントです。

## 概要

オプションファクトリは以下の機能を提供します：

- 標準オプションの定義と管理
- オプションの登録と取得
- エイリアス（短縮形）の管理
- コマンドライン引数からのオプション生成
- カスタム変数オプションのサポート

> 注意: バリデーションは `/validator` ディレクトリの別コンポーネントで行われます。このファクトリはオプションの生成と管理のみを担当します。

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

### 3. カスタム変数オプション (CustomVariableOption)

- `--uv-*` 形式のカスタム変数
- 変数名のパターン検証
- 任意の値を受け入れる

## 使用例

### 基本的な使用

```typescript
const factory = new CommandLineOptionFactory();

// コマンドライン引数からのオプション生成
const args = ['--help', '-i=value', '--uv-config=config.json'];
const options = factory.createOptionsFromArgs(args);

// 生成されたオプションの使用
options.forEach((option) => {
  if (option.name === 'help') {
    // ヘルプメッセージを表示
  } else if (option.name === 'input') {
    const value = option.parse('-i=value');
    // 入力ファイルの処理
  }
});
```

### エイリアスの使用

```typescript
// 長い名前と短い名前の両方で同じオプションにアクセス可能
const helpOption = factory.createOptionsFromArgs(['--help'])[0];
const shortHelpOption = factory.createOptionsFromArgs(['-h'])[0];

// 両方とも同じオプションとして扱われる
assertEquals(helpOption.name, shortHelpOption.name); // true
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
