# アーキテクチャ図

このドキュメントは、breakdownparamsライブラリのアーキテクチャを図で説明します。

## 1. コンポーネント図

```mermaid
graph TD
    subgraph "オプション生成"
        A[CLI Args] --> B[OptionFactory]
        B --> C[Option Instances]
    end

    subgraph "パラメータ処理"
        C --> D[ParamsParser]
        D --> E[ParamsValidator]
        E --> F1[ZeroParamsValidator]
        E --> F2[OneParamValidator]
        E --> F3[TwoParamsValidator]
    end

    subgraph "オプション処理"
        C --> G[Option自身の検証]
        G --> H[OptionValidator]
        H --> I1[ZeroOptionValidator]
        H --> I2[OneOptionValidator]
        H --> I3[TwoOptionValidator]
        I1 --> J[OptionCombinationValidator]
        I2 --> J
        I3 --> J
    end

    subgraph "設定"
        D --> K[ParserConfig]
        K --> L1[DEFAULT_CONFIG]
        K --> L2[CustomConfig]
    end
```

## 2. シーケンス図

### 2.1 パラメータ解析フロー

```mermaid
sequenceDiagram
    participant User
    participant Factory as OptionFactory
    participant Option as Option Instance
    participant Parser as ParamsParser
    participant PValidator as ParamsValidator
    participant OValidator as OptionValidator
    participant OCombValidator as OptionCombinationValidator
    participant Result as ParamsResult
    
    User->>Factory: createOptions(args)
    Factory->>Option: new Option(rawInput)
    Option->>Option: 入力形式判定
    Option->>Option: 正規化
    Factory-->>Parser: Option[]
    
    Parser->>Option: toNormalized()
    Parser->>Option: getValue()
    
    Parser->>PValidator: validate(params)
    PValidator->>PValidator: パラメータ検証実行
    PValidator-->>Parser: パラメータ検証結果
    
    Parser->>Option: validate()
    Option->>Option: 自身の検証
    Option-->>Parser: 個別検証結果
    
    alt パラメータタイプ判定
        Parser->>OValidator: validate(options, type)
        OValidator-->>Parser: オプション検証結果
        
        Parser->>OCombValidator: validate(options)
        OCombValidator-->>Parser: 組み合わせ検証結果
    end
    
    Parser->>Parser: 結果の統合
    Parser->>Result: 適切なResult作成
    Result-->>User: 最終結果
```

### 2.2 エラー処理フロー

```mermaid
sequenceDiagram
    participant Parser as ParamsParser
    participant PValidator as ParamsValidator
    participant OValidator as OptionValidator
    participant OCombValidator as OptionCombinationValidator
    participant Error as ErrorHandler
    
    Parser->>PValidator: validate(args)
    
    alt パラメータエラー
        PValidator->>Error: createError()
        Error-->>PValidator: ErrorResult
        PValidator-->>Parser: ErrorResult
    else オプションエラー
        Parser->>OValidator: validate(args, type, optionRule)
        OValidator->>Error: createError()
        Error-->>OValidator: ErrorResult
        OValidator-->>Parser: ErrorResult
    else 組み合わせエラー
        Parser->>OCombValidator: validate(options)
        OCombValidator->>Error: createError()
        Error-->>OCombValidator: ErrorResult
        OCombValidator-->>Parser: ErrorResult
    end
    
    Parser->>Parser: handleError()
    Parser-->>User: ErrorResult
```

## 3. 状態遷移図

### 3.1 バリデーション状態

```mermaid
stateDiagram-v2
    [*] --> パラメータ検証
    パラメータ検証 --> パラメータタイプ判定
    パラメータタイプ判定 --> オプション検証
    オプション検証 --> 組み合わせ検証
    組み合わせ検証 --> 結果統合
    結果統合 --> [*]
    
    パラメータ検証 --> エラー: パラメータエラー
    パラメータタイプ判定 --> エラー: 無効なパラメータ
    オプション検証 --> エラー: オプションエラー
    組み合わせ検証 --> エラー: 組み合わせエラー
    エラー --> [*]
```

## 4. データフロー図

```mermaid
graph LR
    A[CLI Args] --> B[OptionFactory]
    B --> C[Option Instances]
    C --> D[ParamsParser]
    
    subgraph "パラメータ処理"
        D --> E1[ParamsValidator]
        E1 --> F1[パラメータ検証結果]
    end
    
    subgraph "オプション処理"
        C --> G[Option.validate()]
        G --> H[個別検証結果]
        F1 --> I[パラメータタイプ判定]
        I --> J1[ZeroOptionValidator]
        I --> J2[OneOptionValidator]
        I --> J3[TwoOptionValidator]
        J1 --> K[組み合わせ検証]
        J2 --> K
        J3 --> K
    end
    
    F1 --> L[結果統合]
    H --> L
    K --> L
    L --> M[ParamsResult]
```

## 5. クラス階層図

```mermaid
classDiagram
    class Option {
        <<interface>>
        +rawInput: string
        +canonicalName: string
        +longForm: string
        +shortForm?: string
        +isShorthand(): boolean
        +isLongForm(): boolean
        +isUserVariable(): boolean
        +matchesInput(input: string): boolean
        +toNormalized(): string
        +toLong(): string
        +toShort(): string | undefined
        +validate(): ValidationResult
        +getValue(): string | boolean
    }
    
    class FlagOption {
        +validate(): ValidationResult
        +getValue(): boolean
    }
    
    class ValueOption {
        +validate(): ValidationResult
        +getValue(): string
    }
    
    class UserVariableOption {
        +validate(): ValidationResult
        +getValue(): string
        +toNormalized(): string
    }
    
    class OptionFactory {
        +createOptions(args: string[]): Option[]
    }
    
    class ParamsParser {
        +parse(args: string[]): ParamsResult
        -config: ParserConfig
    }
    
    class ParamsValidator {
        <<interface>>
        +validate(args: string[]): ValidationResult
    }
    
    class OptionValidator {
        <<interface>>
        +validate(options: Option[], type: string): ValidationResult
    }
    
    Option <|.. FlagOption
    Option <|.. ValueOption
    Option <|.. UserVariableOption
    OptionFactory --> Option
    ParamsParser --> OptionFactory
    ParamsParser --> ParamsValidator
    ParamsParser --> OptionValidator
```

## 6. パッケージ図

```mermaid
graph TD
    A[breakdownparams] --> B[parser]
    A --> C[validator]
    A --> D[option-models]
    A --> E[factories]
    A --> F[result]
    
    subgraph "option-models"
        D --> D1[FlagOption]
        D --> D2[ValueOption]
        D --> D3[UserVariableOption]
    end
    
    subgraph "factories"
        E --> E1[OptionFactory]
    end
    
    subgraph "validator"
        C --> C1[params]
        C --> C2[options]
        C2 --> C3[combination]
    end
```

---

[日本語版](layer2_diagrams.ja.md) | [English Version](layer2_diagrams.md) 