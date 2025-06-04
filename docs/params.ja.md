# パラメータの仕様

## パラメータの型定義

```typescript
type ParamPatternResult = ZeroParamResult | OneParamResult | TwoParamResult;

type ZeroParamResult = {
  type: 'help' | 'version';
  help?: boolean;
  version?: boolean;
  error?: ErrorInfo;
};

type OneParamResult = {
  type: 'layer';
  command: string;
  options: OptionParams;
  error?: ErrorInfo;
};

type TwoParamResult = {
  type: 'break';
  demonstrativeType: string;
  layerType: string;
  options: OptionParams;
  error?: ErrorInfo;
};

// パーサー設定の型定義
interface ParserConfig {
  // DemonstrativeTypeの設定
  demonstrativeType: {
    // 許可する値のパターン（正規表現）
    pattern: string;
    // カスタムエラーメッセージ
    errorMessage?: string;
  };

  // LayerTypeの設定
  layerType: {
    // 許可する値のパターン（正規表現）
    pattern: string;
    // カスタムエラーメッセージ
    errorMessage?: string;
  };
}

// デフォルト設定値
const DEFAULT_CONFIG: ParserConfig = {
  demonstrativeType: {
    pattern: '^(to|summary|defect)$',
    errorMessage: 'Invalid demonstrative type. Must be one of: to, summary, defect'
  },
  layerType: {
    pattern: '^(project|issue|task)$',
    errorMessage: 'Invalid layer type. Must be one of: project, issue, task'
  }
};
```

## パラメータのパターン

1. **ZeroParams**
   - helpコマンド
   - versionコマンド

2. 単一パラメータ（OneParamResult）
   - layerコマンド
   - コマンド名とオプション

3. 二重パラメータ（TwoParamResult）
   - breakコマンド
   - DemonstrativeTypeとLayerTypeのバリデーション
   - オプション

## オプションパラメータ

```typescript
type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: string;  // LayerTypeのパターンでバリデーション
  adaptationType?: string;
  configFile?: string;
  customVariables?: Record<string, string>;
};
```

## エラー処理

各パラメータ型は`error`プロパティを持ち、エラー情報を含むことができます：

```typescript
type ErrorInfo = {
  message: string;
  code: string;
  category: string;
  details?: Record<string, unknown>;
};
```

## 使用例

```typescript
// パラメータなし
const helpResult: ZeroParamResult = {
  type: 'help',
  help: true
};

// 単一パラメータ
const layerResult: OneParamResult = {
  type: 'layer',
  command: 'create',
  options: {
    fromFile: 'input.json'
  }
};

// 二重パラメータ（デフォルト設定値を使用）
const breakResult: TwoParamResult = {
  type: 'break',
  demonstrativeType: 'to',      // パターン: ^(to|summary|defect)$
  layerType: 'project',         // パターン: ^(project|issue|task)$
  options: {
    fromFile: 'input.json',
    destinationFile: 'output.json',
    fromLayerType: 'issue'      // パターン: ^(project|issue|task)$
  }
};

// カスタム設定値での使用例
const customConfig: ParserConfig = {
  demonstrativeType: {
    pattern: '^[a-z]+$',  // 小文字のアルファベットのみ許可
    errorMessage: 'Invalid demonstrative type'
  },
  layerType: {
    pattern: '^[a-z]+$',  // 小文字のアルファベットのみ許可
    errorMessage: 'Invalid layer type'
  }
};

const parser = new ParamsParser(customConfig);
```

# パラメータ仕様

このドキュメントでは、ハイフンなしのパラメータ（位置引数）の仕様を定義します。

# パラメータパターン

ハイフンなしのパラメータの数に基づいて処理が分岐します。
各パターンは特定のデータ構造に対応します。これらのパターンは相互に排他的です。

- ハイフン付きオプションのみ（0パラメータ）
  - アプリケーションヘルプとバージョン表示の特別処理
- 1パラメータのみ
  - アプリケーション初期化の特別処理
- 2パラメータ
  - メインアプリケーション実行
  - DemonstrativeTypeとLayerTypeのバリデーション
  - ハイフン付きパラメータは追加オプションとして機能
- 3つ以上のパラメータはエラー
- パラメータなしは空のパラメータ結果を返す

# 各パラメータパターンの処理

## ハイフン付きオプションのみ（0パラメータ）

使用例：

```bash
./.deno/bin/breakdown -h
```

### 可能な値

- -h, --help
- -v, --version

エイリアスがサポートされています。
引数の存在を示します。複数のオプションを同時に指定できます。

## 単一パラメータ

使用例：

```bash
./.deno/bin/breakdown init
```

### 可能な値

- `init`

引数が何を表すかを示します。
例えば、初期化時にパラメータが`init`であることを確認できます。

## 2パラメータ

使用パターン：

```bash
./.deno/bin/breakdown $1 $2
```

例：

```bash
./.deno/bin/breakdown to issue
```

最初のオプション（$1）は`DemonstrativeType`と呼ばれ、正規表現パターンでバリデーションされます。
2番目のオプション（$2）は`LayerType`と呼ばれ、正規表現パターンでバリデーションされます。

### デフォルトのバリデーションルール

#### DemonstrativeType
デフォルトの正規表現パターン：`^(to|summary|defect)$`
- to
- summary
- defect

#### LayerType
デフォルトの正規表現パターン：`^(project|issue|task)$`
- project
- issue
- task

### ハイフン付きオプション値

#### --from `<file>`

オプション名：FromFile
エイリアス：`-f`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --from=<file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -f=<file>
```

##### FromFile値

- `<file>`部分を取得
- 例：`--from=./.agent/breakdown/issues/issue_summary.md`の場合、`./.agent/breakdown/issues/issue_summary.md`を保存

#### --destination `<output_file>`

オプション名：DestinationFile
エイリアス：`-o`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --destination=<output_file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -o=<output_file>
```

##### DestinationFile値

- `<output_file>`部分を取得
- 例：`--destination=./.agent/breakdown/issues/issue_summary.md`の場合、`./.agent/breakdown/issues/issue_summary.md`を保存

#### --input `<from_layer_type>`

オプション名：FromLayerType
エイリアス：`-i`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --input=<from_layer_type>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -i=<from_layer_type>
```

##### from_layer_type値

- `<from_layer_type>`部分を取得
- 例：`--input=issue`の場合、`issue`を保存
- デフォルトの正規表現パターン：`^(project|issue|task)$`

#### --config `<config_file>`

オプション名：ConfigFile
エイリアス：`-c`
以下は同等です：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --config=<config_file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -c=<config_file>
```

##### ConfigFile値

- `<config_file>`部分を取得
- 例：`--config=test`の場合、`test`を保存

#### カスタム変数オプション（`--uv-*`）

カスタム変数オプションは、ユーザー定義の変数を指定するためのオプションです。
TwoParamsモードでのみ使用可能で、以下の形式で指定します：

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --uv-<name>=<value>
```

## エラーケース

| エラーケース            | メッセージ例                                           |
| ----------------------- | ------------------------------------------------------ |
| 引数過多                | "Too many arguments. Maximum 2 arguments are allowed." |
| 不正なDemonstrativeType | "Invalid demonstrative type. Must be one of: to, summary, defect" |
| 不正なLayerType         | "Invalid layer type. Must be one of: project, issue, task" |
| 不正なConfig使用        | "Config option is only available with TwoParams"       |

## 返却型

パラメータの解析結果は、以下の型で返却されます：

```typescript
type ParamsResult = ZeroParamResult | OneParamResult | TwoParamResult;
```