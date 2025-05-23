# パラメータ仕様

このドキュメントは、breakdownparamsライブラリのパラメータ（位置引数）の仕様を定義します。

## パラメータタイプ

パラメータは、位置引数の数に基づいて3つのタイプに分類されます：

1. **NoParams**
   - 位置引数なし
   - オプションのみ指定可能
   - 例：`breakdown --help`

2. **SingleParam**
   - 位置引数1つ
   - 有効な値：`init`
   - 例：`breakdown init`

3. **DoubleParams**
   - 位置引数2つ
   - 形式：`<demonstrativeType> <layerType>`
   - 例：`breakdown to project`

## DemonstrativeType

最初のパラメータとして指定可能な値：

| 値      | 説明         |
| ------- | ------------ |
| to      | 対象への変換 |
| summary | 要約の生成   |
| defect  | 欠陥の報告   |

## LayerType

2番目のパラメータとして指定可能な値：

| 値      | 説明         |
| ------- | ------------ |
| project | プロジェクト |
| issue   | 課題         |
| task    | タスク       |

## パラメータの制約

1. **引数の数**
   - 0個：オプションのみ許可
   - 1個：`init`コマンドのみ許可
   - 2個：demonstrativeTypeとlayerTypeの組み合わせ
   - 3個以上：エラー

2. **値の制約**
   - 大文字を含むエイリアスは無効として扱う

## 使用例

### NoParams

```bash
breakdown
```

### SingleParam

```bash
breakdown init
```

### DoubleParams

```bash
breakdown to project
breakdown summary issue
breakdown defect task
```

## エラーケース

| エラーケース            | メッセージ例                                           |
| ----------------------- | ------------------------------------------------------ |
| 引数過多                | "Too many arguments. Maximum 2 arguments are allowed." |
| 不正なDemonstrativeType | "Invalid value for demonstrativeType: {value}"         |
| 不正なLayerType         | "Invalid value for layerType: {value}"                 |
