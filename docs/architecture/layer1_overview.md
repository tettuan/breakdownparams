# Architecture Overview

This document provides an overview of the breakdownparams library architecture.

## 1. System Structure

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

## 2. Component Description

### 2.1 Core Components

1. **ParamsParser**
   - Main entry point for parameter parsing
   - Coordinates validation flow
   - Returns parsed results

2. **SecurityErrorValidator**
   - Validates input security
   - Checks for security violations
   - Prevents malicious input

3. **OptionsValidator**
   - Validates common options
   - Checks option format and values
   - Ensures option consistency

4. **ParamSpecificOptionValidator**
   - Validates options specific to parameter types
   - Applies type-specific rules
   - Ensures parameter-option compatibility

5. **ParamsValidator**
   - Validates parameter format and values
   - Applies parameter-specific rules
   - Ensures parameter consistency

### 2.2 Validation Rules

1. **ZeroOptionRules**
   - Rules for zero parameter options
   - Format and value validation
   - Type-specific constraints

2. **OneOptionRules**
   - Rules for one parameter options
   - Format and value validation
   - Type-specific constraints

3. **TwoOptionRules**
   - Rules for two parameter options
   - Format and value validation
   - Type-specific constraints

## 3. Data Flow

### 3.1 Input Processing
```mermaid
sequenceDiagram
    participant User
    participant Parser as ParamsParser
    participant Validator as SecurityErrorValidator
    participant Options as OptionsValidator
    participant Params as ParamsValidator

    User->>Parser: parse(args)
    Parser->>Validator: validate(args)
    Validator-->>Parser: securityResult
    Parser->>Options: validate(args)
    Options-->>Parser: optionsResult
    Parser->>Params: validate(params)
    Params-->>Parser: paramResult
    Parser-->>User: ParamsResult
```

### 3.2 Validation Flow
```mermaid
sequenceDiagram
    participant Parser as ParamsParser
    participant Security as SecurityErrorValidator
    participant Options as OptionsValidator
    participant Specific as ParamSpecificOptionValidator
    participant Params as ParamsValidator

    Parser->>Security: validate(args)
    Security-->>Parser: securityResult
    Parser->>Options: validate(args)
    Options-->>Parser: optionsResult
    Parser->>Specific: validateForParamType(options)
    Specific-->>Parser: paramSpecificResult
    Parser->>Params: validate(params)
    Params-->>Parser: paramResult
```

## 4. Error Handling

### 4.1 Error Types
```mermaid
classDiagram
    class ValidationError {
        +message: string
        +code: string
        +details: object
    }
    
    class SecurityError {
        +message: string
        +code: string
        +details: object
    }
    
    class OptionError {
        +message: string
        +code: string
        +details: object
    }
    
    class ParamError {
        +message: string
        +code: string
        +details: object
    }
    
    ValidationError <|-- SecurityError
    ValidationError <|-- OptionError
    ValidationError <|-- ParamError
```

### 4.2 Error Flow
```mermaid
graph TD
    A[ValidationError] --> B[ErrorHandler]
    B --> C[ErrorResult]
    
    A --> D[SecurityError]
    A --> E[OptionError]
    A --> F[ParamError]
    
    D --> G[SecurityErrorResult]
    E --> H[OptionErrorResult]
    F --> I[ParamErrorResult]
```

## 5. Result Types

### 5.1 Success Results
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
    
    ParamsResult <|-- ZeroParamsResult
    ParamsResult <|-- OneParamResult
    ParamsResult <|-- TwoParamResult
```

### 5.2 Error Results
```mermaid
classDiagram
    class ErrorResult {
        +type: "error"
        +error: ErrorInfo
    }
    
    class ErrorInfo {
        +message: string
        +code: string
        +details: object
    }
    
    ErrorResult --> ErrorInfo
```

## 6. Configuration

### 6.1 Parser Configuration
```mermaid
classDiagram
    class ParserConfig {
        +demonstrativeType: TypeConfig
        +layerType: TypeConfig
    }
    
    class TypeConfig {
        +pattern: string
        +errorMessage?: string
    }
    
    ParserConfig --> TypeConfig
```

### 6.2 Default Configuration
```mermaid
classDiagram
    class DefaultConfig {
        +demonstrativeType: TypeConfig
        +layerType: TypeConfig
    }
    
    class TypeConfig {
        +pattern: string
        +errorMessage?: string
    }
    
    DefaultConfig --> TypeConfig
```

---

[日本語版](layer1_overview.ja.md) | [English Version](layer1_overview.md) 