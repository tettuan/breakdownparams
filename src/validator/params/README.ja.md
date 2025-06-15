# params ディレクトリ サブモジュール概要

このディレクトリは、コマンドラインパラメータのバリデーションに関する主要なロジックを提供します。

> **メインの詳細ドキュメントは `docs/` 配下にあります。ここは概要・導入ガイドです。**

---

## ファイル構成と役割

### base_validator.ts

- **役割**: バリデータの基本クラスを提供
- **主な機能**:
  - 抽象クラスとして、パラメータ検証の基本インターフェースを定義
  - `validate(params: string[]): ValidationResult` メソッドを抽象メソッドとして定義

### zero_params_validator.ts

- **役割**: パラメータが0個であることを検証
- **主な機能**:
  - パラメータ配列が空であることを確認
  - パラメータが存在する場合はエラーを返す

### one_param_validator.ts

- **役割**: パラメータが1個であることを検証
- **主な機能**:
  - パラメータが1個であることを確認
  - `init` コマンドのみを許可
  - 不正なパラメータの場合はエラーを返す

### two_params_validator.ts

- **役割**: パラメータが2個であることを検証
- **主な機能**:
  - DemonstrativeType と LayerType のバリデーション
  - カスタマイズ可能な設定（CustomConfig）
  - デフォルトパターン: "^(to|summary|defect)$" と "^(project|issue|task)$"
  - 詳細なエラーメッセージとエラーコードの提供

---

## 関連仕様・詳細ドキュメント

- [docs/validation.ja.md](../../docs/validation.ja.md): バリデーション仕様・エラー定義
- [docs/params.md](../../docs/params.md): パラメータ仕様・フォーマット・制約
- [docs/architecture/layer2_diagrams.ja.md](../../docs/architecture/layer2_diagrams.ja.md): バリデーション・パラメータ検証のシーケンス/クラス図
- [docs/architecture/layer5_implementation.ja.md](../../docs/architecture/layer5_implementation.ja.md): 実装詳細

---

## 注意事項

- 本ディレクトリの各ファイルは「docs/」配下のドキュメントを参照しながら設計・実装されています。
- 詳細な仕様や拡張ルール、エラーケース、利用例は必ず docs/ を参照してください。
