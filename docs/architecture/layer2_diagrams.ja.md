# アーキテクチャ図

このドキュメントは、breakdownparamsライブラリのアーキテクチャを図で説明します。

## 1. コンポーネント図

```mermaid
graph TD
    subgraph "パラメータ処理"
        A[ParamsParser] --> B[ParamsValidator]
        B --> C1[ZeroParamsValidator]
        B --> C2[OneParamValidator]
        B --> C3[TwoParamsValidator]
    end

    subgraph "オプション処理"
        A --> D[OptionValidator]
        D --> E1[ZeroOptionValidator]
        D --> E2[OneOptionValidator]
        D --> E3[TwoOptionValidator]
        E1 --> F[OptionCombinationValidator]
        E2 --> F
        E3 --> F
    end

    subgraph "設定"
        A --> G[ParserConfig]
        G --> H1[DEFAULT_CONFIG]
        G --> H2[CustomConfig]
    end
```

## 2. シーケンス図

### 2.1 パラメータ解析フロー

```mermaid
sequenceDiagram
    participant User
    participant Parser as ParamsParser
    participant PValidator as ParamsValidator
    participant OValidator as OptionValidator
    participant OCombValidator as OptionCombinationValidator
    participant Result as ParamsResult
    
    User->>Parser: parse(args)
    
    Parser->>PValidator: validate(args)
    PValidator->>PValidator: パラメータ検証実行
    PValidator-->>Parser: パラメータ検証結果
    
    alt パラメータタイプ判定
        Parser->>OValidator: validate(args, type, optionRule)
        OValidator->>OValidator: オプション検証実行
        OValidator-->>Parser: オプション検証結果
        
        Parser->>OCombValidator: validate(options)
        OCombValidator->>OCombValidator: 組み合わせ検証実行
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
    A[CLI Args] --> B[ParamsParser]
    
    subgraph "パラメータ処理"
        B --> C1[ParamsValidator]
        C1 --> D1[パラメータ検証結果]
    end
    
    subgraph "オプション処理"
        D1 --> E[パラメータタイプ判定]
        E --> F1[ZeroOptionValidator]
        E --> F2[OneOptionValidator]
        E --> F3[TwoOptionValidator]
        F1 --> G[オプション検証]
        F2 --> G
        F3 --> G
        G --> H[組み合わせ検証]
    end
    
    D1 --> I[結果統合]
    H --> I
    I --> J[ParamsResult]
```

## 5. クラス階層図

```mermaid
classDiagram
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
        +validate(args: string[], type: string, optionRule: OptionRule): ValidationResult
    }
    
    class ZeroParamsValidator {
        +validate(args: string[]): ValidationResult
    }
    
    class OneParamValidator {
        +validate(args: string[]): ValidationResult
    }
    
    class TwoParamsValidator {
        +validate(args: string[]): ValidationResult
    }
    
    class ZeroOptionValidator {
        +validate(args: string[], type: string, optionRule: OptionRule): ValidationResult
    }
    
    class OneOptionValidator {
        +validate(args: string[], type: string, optionRule: OptionRule): ValidationResult
    }
    
    class TwoOptionValidator {
        +validate(args: string[], type: string, optionRule: OptionRule): ValidationResult
    }
    
    class OptionCombinationValidator {
        +validate(options: Record<string, unknown>): OptionCombinationResult
    }
    
    ParamsParser --> ParamsValidator
    ParamsParser --> OptionValidator
    ParamsValidator <|.. ZeroParamsValidator
    ParamsValidator <|.. OneParamValidator
    ParamsValidator <|.. TwoParamsValidator
    OptionValidator <|.. ZeroOptionValidator
    OptionValidator <|.. OneOptionValidator
    OptionValidator <|.. TwoOptionValidator
    ParamsParser --> OptionCombinationValidator
```

## 6. パッケージ図

```mermaid
graph TD
    A[breakdownparams] --> B[parser]
    A --> C[validator]
    A --> D[options]
    A --> E[result]
    
    subgraph "validator"
        C --> C1[params]
        C --> C2[options]
    end
    
    subgraph "options"
        D --> D1[combination]
        D --> D2[individual]
        D2 --> D3[zero]
        D2 --> D4[one]
        D2 --> D5[two]
    end
```

---

[日本語版](layer2_diagrams.ja.md) | [English Version](layer2_diagrams.md) 