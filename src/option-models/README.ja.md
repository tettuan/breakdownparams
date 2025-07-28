# オプションモデル実装

このディレクトリは、コマンドラインオプションの解析と検証を担当するモジュールを提供します。コマンドライン引数の処理は、アプリケーションの入力インターフェースとして重要な役割を果たしますが、従来の実装では型安全性や検証の一貫性に課題がありました。

> 注意: このドキュメントは概要のみを提供します。詳細な仕様は `docs/` ディレクトリの各ドキュメントを参照してください。

## 設計の背景と目的

### オプションクラス中心の設計

このライブラリは、各オプションインスタンスが独自の正規化、検証、変換ロジックを保持するオプションクラス中心の設計を採用しています。この設計により以下が実現されます：

- **単一責任原則**: 各オプションクラスが自身の動作を管理
- **一貫性**: システム全体で統一された正規化ルール
- **拡張性**: 新しいオプションタイプの追加が容易
- **カプセル化**: 内部表現と外部インターフェースの分離

### 正規化ルールの統一

すべてのオプションは以下の正規化ルールに従います：

- 先頭のハイフンを除去した形式を正規名とする
- エイリアスは主要名に解決される
- 例：
  - `--help` → `help`
  - `-h` → `help`
  - `--uv-config` → `uv-config`

コマンドライン引数の処理において、以下の課題が存在していました：

1. **型安全性の欠如**
   - 文字列としての引数を適切な型に変換する際のエラーが実行時まで検出できない
   - 型の不一致による予期せぬ動作のリスクが高い
   - 開発時の型チェックが不十分

2. **正規化処理の分散**
   - 複数の場所で異なる正規化ロジックが実装されていた
   - ショートハンドオプションの処理が不完全
   - ユーザー変数オプションの扱いが一貫していない

3. **拡張性の制限**
   - 新しいオプションタイプの追加が困難
   - カスタム検証ルールの実装が複雑
   - 既存コードの修正が必要

これらの課題を解決するため、オプションモデルは以下の目的を達成するように設計されています：

1. **型安全性の確保**
   - コンパイル時に型の整合性をチェック
   - 実行時エラーを事前に検出
   - 型変換の安全性を保証

2. **正規化の一元管理**
   - 各オプションクラスが自身の正規化ロジックを保持
   - 一貫した正規化ルールの適用
   - 内部表現と外部表現の明確な分離

3. **拡張性の提供**
   - インターフェースベースの設計
   - プラグイン可能な検証ルール
   - 既存コードへの影響を最小限に

## アーキテクチャ設計

オプションモデルのアーキテクチャは、単一責任の原則と関心の分離に基づいて設計されています。これにより、各コンポーネントが明確な責務を持ち、保守性と拡張性を確保しています。

### 1. コアインターフェース

`Option`インターフェースは、すべてのオプションタイプの基本となる契約を定義します。このインターフェースは、オプションの基本的な属性と振る舞いを規定します：

```typescript
interface Option {
  // 基本プロパティ
  readonly rawInput: string; // 元の入力
  readonly canonicalName: string; // 正規化名（ハイフン除去）
  readonly longForm: string; // ロングフォーム
  readonly shortForm?: string; // ショートフォーム

  // 判定メソッド
  isShorthand(): boolean;
  isLongForm(): boolean;
  isUserVariable(): boolean;
  matchesInput(input: string): boolean;

  // 変換メソッド
  toNormalized(): string;
  toLong(): string;
  toShort(): string | undefined;

  // バリデーション
  validate(): ValidationResult;
  getValue(): string | boolean;
}
```

### 2. オプション実装の階層

オプションの実装は、共通のインターフェースを実装しながら、それぞれの特性に応じた振る舞いを提供します：

- **`FlagOption`**: 値を持たないフラグの存在確認に特化
- **`ValueOption`**: 値の検証と型変換を担当
- **`UserVariableOption`**: ユーザー変数の命名規則と値の検証を管理（`--uv-*` → `uv-*`に正規化）

### 3. 検証パイプライン

検証プロセスは、以下の3つの層で構成されています：

1. **パーサー層**
   - コマンドライン引数の文字列を解析
   - オプションとその値を抽出
   - 基本的な構文チェック

2. **バリデーター層**
   - オプションの形式を検証
   - 値の型チェックを実行
   - カスタム検証ルールを適用

3. **レジストリ層**
   - オプションの登録と管理
   - エイリアスの解決
   - オプションの検索と取得

## 実装例

### Optionインターフェースの実装

```typescript
class ValueOption implements Option {
  readonly rawInput: string;
  readonly canonicalName: string;
  readonly longForm: string;
  readonly shortForm?: string;
  private value?: string;

  constructor(
    input: string,
    aliases: string[] = [],
    private validator?: (value: string) => ValidationResult,
  ) {
    this.rawInput = input;
    this.longForm = input.startsWith('--') ? input : `--${input}`;
    this.shortForm = aliases.find((a) => a.startsWith('-') && !a.startsWith('--'));

    // 正規化：先頭のハイフンを除去
    this.canonicalName = input.replace(/^-+/, '');
  }

  validate(): ValidationResult {
    if (!this.value) {
      return { isValid: true, validatedParams: [] };
    }
    if (this.validator) {
      return this.validator(this.value);
    }
    return { isValid: true, validatedParams: [] };
  }

  getValue(): string | boolean {
    return this.value || '';
  }
}
```

### ユーザー変数オプションの実装

```typescript
class UserVariableOption implements Option {
  readonly rawInput: string;
  readonly canonicalName: string;
  readonly longForm: string;
  readonly variableName: string;
  private value?: string;

  constructor(input: string) {
    this.rawInput = input;
    this.longForm = input;

    // --uv-nameから変数名を抽出
    const match = input.match(/^--uv-(.+)/);
    this.variableName = match ? match[1] : '';

    // 正規化：--uv-config → uv-config
    this.canonicalName = `uv-${this.variableName}`;
  }

  validate(): ValidationResult {
    // 変数名の検証
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(this.variableName)) {
      return {
        isValid: false,
        errors: [`Invalid user variable name: ${this.variableName}`],
      };
    }
    return { isValid: true, validatedParams: [] };
  }

  getValue(): string | boolean {
    return this.value || '';
  }
}
```

## 実装の特徴

オプションモデルの実装は、以下の特徴を持っています：

1. **型安全性**
   - TypeScriptの型システムを最大限活用
   - 実行時エラーをコンパイル時に検出
   - 型変換の安全性を保証

2. **検証機能**
   - 各オプションタイプに特化した検証ロジック
   - カスタム検証ルールの柔軟な実装
   - エラーメッセージの一貫性

3. **拡張性**
   - インターフェースベースの設計
   - プラグイン可能な検証ルール
   - 既存コードへの影響を最小限に

4. **一貫性**
   - 共通のインターフェース
   - 統一されたエラーハンドリング
   - 標準化された検証プロセス

## 使用例

### フラグオプション

```typescript
const helpOption = new FlagOption('--help', ['-h'], 'Show help message');
```

### 値を持つオプション

```typescript
const fromOption = new ValueOption(
  '--from',
  ['-f'],
  false,
  'Input file',
  (value) => ({ isValid: true, validatedParams: [] }),
);
```

### ユーザー変数オプション

```typescript
const userOption = new UserVariableOption('--uv-project');
console.log(userOption.canonicalName); // 'uv-project' (先頭のハイフンを除去)
console.log(userOption.validate().isValid); // true
console.log(userOption.getValue()); // ユーザーが指定した値
```

## 関連ドキュメント

- [オプション仕様](docs/options.ja.md)
- [カスタム変数オプション仕様](docs/user_variable_options.ja.md)
- [パラメータ型定義仕様](docs/params_type.ja.md)

# Option Models 実装設計・責務分担

## チェック順序とメソッドの役割分担

本実装では、コマンドラインオプションのバリデーション処理を以下の順序と責務で整理しています。

### 1. フォーマットチェック（Format Check）

- **目的**: 入力値が最低限の構造（例: `--uv-`で始まり`=`を含む等）を満たしているかを確認し、後続の詳細なバリデーション処理で発生しうる不要なエラーを未然に防ぐ。
- **実装例**: `startsWith('--uv-')` や `includes('=')` などの基本的な構文チェック。
- **失敗時**: ここでエラーとなった場合は、以降の処理は行わず即エラーを返す。

### 2. 名前と値の分離（Extract Name & Value）

- **目的**: 入力値を`=`で分割し、オプション名部分と値部分を明確に分離する。
- **実装例**: `const [variableName, value] = strValue.split('=')` など。

### 3. バリデーション（Validation）

- **目的**: 分離した名前・値それぞれに対して仕様に基づく詳細なバリデーションを行う。
  - **名前バリデーション**: 変数名が空でないか、正規表現パターン（例: `/^[a-zA-Z][a-zA-Z0-9_]*$/`）に一致するか等。
  - **値バリデーション**: 必要に応じて値の内容や型を検証。
- **失敗時**: いずれかのバリデーションに失敗した場合は、バリデーションエラーとして統一的にエラーを返す。

### 4. 成功時

- **バリデーションが全て通過した場合のみ成功**とし、値の抽出や後続処理へ進む。

---

## メソッドの責務

- `validate`: 上記の全てのチェック・バリデーションを順序通りに実行し、失敗時は即時エラーを返す。成功時はバリデーション済みのパラメータを返す。
- `parse`: バリデーション済みの入力値から、実際に利用する値部分のみを抽出する。

---

この設計により、エラーの発生箇所や原因が明確になり、保守性・拡張性の高いバリデーション処理を実現しています。
