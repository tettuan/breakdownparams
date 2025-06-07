# Architecture Diagrams

This document provides diagrams that illustrate the breakdownparams library architecture.

## 1. Component Diagrams

### 1.1 Overall Structure
```mermaid
graph TD
    A[ParamsParser] --> B[SecurityErrorValidator]
    A --> C[OptionsValidator]
    A --> D[ParamSpecificOptionValidator]
    A --> E[ZeroParamsValidator]
    A --> F[OneParamValidator]
    A --> G[TwoParamsValidator]
    
    D --> H[ZeroOptionRules]
    F --> I[OneOptionRules]
    G --> J[TwoOptionRules]
```

### 1.2 Validation Structure
```mermaid
graph TD
    A[ParamsParser] --> B[ValidationFlow]
    B --> C[SecurityValidation]
    B --> D[OptionValidation]
    B --> E[ParamValidation]
    
    D --> F[CommonOptionValidation]
    D --> G[ParamSpecificOptionValidation]
    
    E --> H[ZeroParamValidation]
    E --> I[OneParamValidation]
    E --> J[TwoParamValidation]
```

## 2. Sequence Diagrams

### 2.1 Parameter Parsing Flow
```mermaid
sequenceDiagram
    participant P as ParamsParser
    participant S as SecurityValidator
    participant O as OptionsValidator
    participant PS as ParamSpecificValidator
    participant PV as ParamValidator

    P->>S: validate(args)
    S-->>P: securityResult
    P->>O: validate(args)
    O-->>P: optionsResult
    P->>PS: validateForParamType(options)
    PS-->>P: paramSpecificResult
    P->>PV: validate(params)
    PV-->>P: paramResult
```

### 2.2 Option Validation Flow
```mermaid
sequenceDiagram
    participant P as ParamsParser
    participant O as OptionsValidator
    participant PS as ParamSpecificValidator
    participant R as Result

    P->>O: validateCommonOptions(args)
    O-->>P: commonValidationResult
    P->>PS: validateParamSpecificOptions(options, paramType)
    PS-->>P: specificValidationResult
    P->>R: createResult(validationResults)
```

## 3. State Transition Diagrams

### 3.1 Parameter Parsing State Transition
```mermaid
stateDiagram-v2
    [*] --> SecurityValidation
    SecurityValidation --> OptionValidation: Valid
    SecurityValidation --> Error: Invalid
    OptionValidation --> ParamSeparation: Valid
    OptionValidation --> Error: Invalid
    ParamSeparation --> ParamSpecificValidation: Separated
    ParamSpecificValidation --> ParamValidation: Valid
    ParamSpecificValidation --> Error: Invalid
    ParamValidation --> Result: Valid
    ParamValidation --> Error: Invalid
    Error --> [*]
    Result --> [*]
```

### 3.2 Option Validation State Transition
```mermaid
stateDiagram-v2
    [*] --> CommonValidation
    CommonValidation --> ParamSpecificValidation: Valid
    CommonValidation --> Error: Invalid
    ParamSpecificValidation --> Result: Valid
    ParamSpecificValidation --> Error: Invalid
    Error --> [*]
    Result --> [*]
```

## 4. Class Diagrams

### 4.1 Validator Structure
```mermaid
classDiagram
    class ParamsParser {
        +parse(args: string[]): ParamsResult
        -validateSecurity(args: string[]): ValidationResult
        -validateOptions(args: string[]): ValidationResult
        -validateParams(params: string[]): ValidationResult
    }
    
    class SecurityErrorValidator {
        +validate(args: string[]): ValidationResult
    }
    
    class OptionsValidator {
        +validate(args: string[]): ValidationResult
    }
    
    class ParamSpecificOptionValidator {
        +validateForZero(options: Record<string, string>): ValidationResult
        +validateForOne(options: Record<string, string>): ValidationResult
        +validateForTwo(options: Record<string, string>): ValidationResult
    }
    
    class ParamsValidator {
        <<interface>>
        +validate(params: string[]): ValidationResult
    }
    
    class ZeroParamsValidator {
        +validate(params: string[]): ValidationResult
    }
    
    class OneParamValidator {
        +validate(params: string[]): ValidationResult
    }
    
    class TwoParamsValidator {
        +validate(params: string[]): ValidationResult
    }
    
    ParamsParser --> SecurityErrorValidator
    ParamsParser --> OptionsValidator
    ParamsParser --> ParamSpecificOptionValidator
    ParamsParser --> ParamsValidator
    ParamsValidator <|-- ZeroParamsValidator
    ParamsValidator <|-- OneParamValidator
    ParamsValidator <|-- TwoParamsValidator
```

### 4.2 Result Type Structure
```mermaid
classDiagram
    class ParamsResult {
        <<interface>>
        +type: string
        +params: string[]
        +options: Record<string, string>
    }
    
    class ZeroParamsResult {
        +type: "zero"
        +params: string[]
        +options: Record<string, string>
    }
    
    class OneParamResult {
        +type: "one"
        +params: string[]
        +options: Record<string, string>
        +demonstrativeType: string
    }
    
    class TwoParamResult {
        +type: "two"
        +params: string[]
        +options: Record<string, string>
        +demonstrativeType: string
        +layerType: string
    }
    
    class ErrorResult {
        +type: "error"
        +error: ErrorInfo
    }
    
    ParamsResult <|-- ZeroParamsResult
    ParamsResult <|-- OneParamResult
    ParamsResult <|-- TwoParamResult
```

## 5. Data Flow Diagrams

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

## 6. Class Hierarchy Diagrams

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

## 7. Package Diagrams

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

[Japanese Version](layer2_diagrams.ja.md) | [English Version](layer2_diagrams.md) 