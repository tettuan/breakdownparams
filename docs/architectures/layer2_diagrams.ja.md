# アーキテクチャ図

このドキュメントは、breakdownparamsライブラリのアーキテクチャを図で説明します。

## 1. コンポーネント図

```mermaid
graph TD
    A[ParamsParser] --> B[BaseValidator]
    B --> C[SecurityErrorValidator]
    B --> D[OptionsValidator]
    B --> E[DemonstrativeTypeValidator]
    B --> F[LayerTypeValidator]
    B --> G[ZeroParamValidator]
    B --> H[OneParamValidator]
    B --> I[TwoParamValidator]
    
    A --> J[ParserConfig]
    J --> K[DEFAULT_CONFIG]
    J --> L[CustomConfig]
    
    I --> M[CustomVariableValidator]
```

## 2. シーケンス図

### 2.1 パラメータ解析フロー

```mermaid
sequenceDiagram
    participant User
    participant Parser as ParamsParser
    participant Validator as ParamsValidator
    participant Config as ParserConfig
    
    User->>Parser: parse(args)
    Parser->>Config: getConfig()
    Config-->>Parser: config
    
    par Validation
        Parser->>Validator: validate(args)
        Validator->>Validator: checkSecurity()
        Validator->>Validator: validateOptions()
        Validator->>Validator: validateParams()
        Validator-->>Parser: result
    end
    
    Parser->>Parser: determineResultType()
    Parser-->>User: ParamsResult
```

### 2.2 エラー処理フロー

```mermaid
sequenceDiagram
    participant Parser as ParamsParser
    participant Validator as ParamsValidator
    participant Error as ErrorHandler
    
    Parser->>Validator: validate(args)
    Validator->>Validator: validateInput()
    
    alt Validation Error
        Validator->>Error: createError()
        Error-->>Validator: ErrorResult
        Validator-->>Parser: ErrorResult
    else Security Error
        Validator->>Error: createSecurityError()
        Error-->>Validator: ErrorResult
        Validator-->>Parser: ErrorResult
    else Config Error
        Validator->>Error: createConfigError()
        Error-->>Validator: ErrorResult
        Validator-->>Parser: ErrorResult
    end
    
    Parser->>Parser: handleError()
    Parser-->>User: ErrorResult
```

## 3. 状態遷移図

### 3.1 バリデーション状態

```mermaid
stateDiagram-v2
    [*] --> Initial
    Initial --> SecurityCheck
    SecurityCheck --> OptionValidation
    OptionValidation --> ParamValidation
    ParamValidation --> ResultGeneration
    ResultGeneration --> [*]
    
    SecurityCheck --> Error: Security Error
    OptionValidation --> Error: Option Error
    ParamValidation --> Error: Param Error
    Error --> [*]
```

### 3.2 エラー状態

```mermaid
stateDiagram-v2
    [*] --> ErrorDetection
    ErrorDetection --> ValidationError
    ErrorDetection --> SecurityError
    ErrorDetection --> ConfigError
    
    ValidationError --> ErrorHandling
    SecurityError --> ErrorHandling
    ConfigError --> ErrorHandling
    
    ErrorHandling --> ErrorResult
    ErrorResult --> [*]
```

## 4. データフロー図

```mermaid
graph LR
    A[CLI Args] --> B[ParamsParser]
    B --> C[Validation]
    C --> D[Result Generation]
    D --> E[ParamsResult]
    
    F[ParserConfig] --> B
    G[ErrorHandler] --> C
    H[CustomVariables] --> C
```

## 5. クラス階層図

```mermaid
classDiagram
    class ParamsParser {
        +parse(args: string[]): ParamsResult
        -config: ParserConfig
        -validators: ParamsValidator[]
    }
    
    class ParamsValidator {
        <<interface>>
        +validate(args: string[]): ValidationResult
    }
    
    class BaseValidator {
        +validate(args: string[]): ValidationResult
        #checkSecurity(): void
        #validateOptions(): void
    }
    
    class ParserConfig {
        +demonstrativeType: ConfigItem
        +layerType: ConfigItem
    }
    
    class ErrorResult {
        +type: string
        +error: ErrorInfo
    }
    
    ParamsParser --> ParserConfig
    ParamsParser --> ParamsValidator
    ParamsValidator <|.. BaseValidator
    BaseValidator --> ErrorResult
```

## 6. パッケージ図

```mermaid
graph TD
    A[breakdownparams] --> B[parser]
    A --> C[validator]
    A --> D[config]
    A --> E[error]
    
    B --> F[types]
    C --> F
    D --> F
    E --> F
```

---

[日本語版](layer2_diagrams.ja.md) | [English Version](layer2_diagrams.md) 