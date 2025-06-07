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

    N[OptionRegistry] --> O[ValueOption]
    N --> P[FlagOption]
    N --> Q[CustomVariableOption]
    
    D --> N
```

## 2. シーケンス図

### 2.1 パラメータ解析フロー

```mermaid
sequenceDiagram
    participant User
    participant Parser as ParamsParser
    participant Validator as ParamsValidator
    participant Config as ParserConfig
    participant Options as OptionRegistry
    
    User->>Parser: parse(args)
    Parser->>Config: getConfig()
    Config-->>Parser: config
    
    par Validation
        Parser->>Validator: validate(args)
        Validator->>Validator: checkSecurity()
        Validator->>Options: validateOptions()
        Options->>Options: validateOption()
        Options-->>Validator: optionResult
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
    participant Options as OptionRegistry
    
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
    else Option Error
        Options->>Error: createOptionError()
        Error-->>Options: ErrorResult
        Options-->>Validator: ErrorResult
        Validator-->>Parser: ErrorResult
    end
    
    Parser->>Parser: handleError()
    Parser-->>User: ErrorResult
```

### 2.3 オプション処理フロー

```mermaid
sequenceDiagram
    participant Parser as ParamsParser
    participant Registry as OptionRegistry
    participant Option as Option
    
    Parser->>Registry: register(option)
    Registry->>Option: validate()
    Option->>Option: validateValue()
    Option-->>Registry: ValidationResult
    
    Parser->>Registry: parse(args)
    Registry->>Option: parse(value)
    Option->>Option: convertValue()
    Option-->>Registry: OptionValue
    Registry-->>Parser: ParsedOptions
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
    ErrorDetection --> OptionError
    
    ValidationError --> ErrorHandling
    SecurityError --> ErrorHandling
    ConfigError --> ErrorHandling
    OptionError --> ErrorHandling
    
    ErrorHandling --> ErrorResult
    ErrorResult --> [*]
```

### 3.3 オプション状態

```mermaid
stateDiagram-v2
    [*] --> OptionRegistration
    OptionRegistration --> OptionValidation
    OptionValidation --> OptionParsing
    OptionParsing --> ValueConversion
    ValueConversion --> [*]
    
    OptionValidation --> OptionError: Invalid Option
    OptionParsing --> OptionError: Parse Error
    ValueConversion --> OptionError: Conversion Error
    OptionError --> [*]
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
    
    I[OptionRegistry] --> C
    J[Options] --> I
    K[OptionValues] --> I
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
    
    class Option {
        <<interface>>
        +name: string
        +aliases: string[]
        +type: OptionType
        +validate(value: string): ValidationResult
        +parse(value: string): OptionValue
    }
    
    class OptionRegistry {
        +register(option: Option): void
        +get(name: string): Option
        +validate(name: string): ValidationResult
    }
    
    ParamsParser --> ParserConfig
    ParamsParser --> ParamsValidator
    ParamsValidator <|.. BaseValidator
    BaseValidator --> ErrorResult
    BaseValidator --> OptionRegistry
    OptionRegistry --> Option
    Option <|.. ValueOption
    Option <|.. FlagOption
    Option <|.. CustomVariableOption
```

## 6. パッケージ図

```mermaid
graph TD
    A[breakdownparams] --> B[parser]
    A --> C[validator]
    A --> D[config]
    A --> E[error]
    A --> F[options]
    
    B --> G[types]
    C --> G
    D --> G
    E --> G
    F --> G
```

---

[日本語版](layer2_diagrams.ja.md) | [English Version](layer2_diagrams.md) 