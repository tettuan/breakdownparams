# Validation Design

This document describes the validation design of the breakdownparams library.

## 1. Overall Validation Structure

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

## 2. Validation Details

### 2.1 Security Validation
```mermaid
graph TD
    A[SecurityErrorValidator] --> B[ValidateInput]
    B --> C[CheckSecurityRules]
    C --> D[ReturnResult]
    
    B --> E[Error: Invalid Input]
    C --> F[Error: Security Violation]
```

### 2.2 Option Validation
```mermaid
graph TD
    A[OptionsValidator] --> B[ValidateCommonOptions]
    B --> C[CheckOptionRules]
    C --> D[ReturnResult]
    
    B --> E[Error: Invalid Option]
    C --> F[Error: Rule Violation]
```

### 2.3 Parameter-Specific Option Validation
```mermaid
graph TD
    A[ParamSpecificOptionValidator] --> B[ValidateForParamType]
    B --> C[CheckParamSpecificRules]
    C --> D[ReturnResult]
    
    B --> E[Error: Invalid Option]
    C --> F[Error: Rule Violation]
```

### 2.4 Parameter Validation
```mermaid
graph TD
    A[ParamsValidator] --> B[ValidateParams]
    B --> C[CheckParamRules]
    C --> D[ReturnResult]
    
    B --> E[Error: Invalid Param]
    C --> F[Error: Rule Violation]
```

## 3. Validation Rules

### 3.1 Security Rules
```mermaid
graph TD
    A[SecurityRules] --> B[InputValidation]
    A --> C[OptionValidation]
    A --> D[ParamValidation]
    
    B --> E[CheckInputFormat]
    C --> F[CheckOptionFormat]
    D --> G[CheckParamFormat]
```

### 3.2 Option Rules
```mermaid
graph TD
    A[OptionRules] --> B[CommonRules]
    A --> C[ParamSpecificRules]
    
    B --> D[FormatRules]
    B --> E[ValueRules]
    
    C --> F[ZeroParamRules]
    C --> G[OneParamRules]
    C --> H[TwoParamRules]
```

### 3.3 Parameter Rules
```mermaid
graph TD
    A[ParamRules] --> B[ZeroParamRules]
    A --> C[OneParamRules]
    A --> D[TwoParamRules]
    
    B --> E[FormatRules]
    C --> F[FormatRules]
    D --> G[FormatRules]
```

## 4. Error Handling

### 4.1 Error Flow
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

### 4.2 Error Types
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

## 5. Validation Results

### 5.1 Result Flow
```mermaid
graph TD
    A[ValidationResult] --> B[SuccessResult]
    A --> C[ErrorResult]
    
    B --> D[ReturnResult]
    C --> E[HandleError]
    
    E --> F[ReturnErrorResult]
```

### 5.2 Result Types
```mermaid
classDiagram
    class ValidationResult {
        +isValid: boolean
        +errors: ValidationError[]
    }
    
    class SuccessResult {
        +isValid: true
        +data: object
    }
    
    class ErrorResult {
        +isValid: false
        +errors: ValidationError[]
    }
    
    ValidationResult <|-- SuccessResult
    ValidationResult <|-- ErrorResult
```

## 6. Option Validation Details

### 6.1 Common Option Validation
```mermaid
graph TD
    A[CommonOptionValidation] --> B[ValidateFormat]
    B --> C[ValidateValue]
    C --> D[ReturnResult]
    
    B --> E[Error: Invalid Format]
    C --> F[Error: Invalid Value]
    
    B --> G[CheckOptionPattern]
    B --> H[CheckOptionLength]
    
    C --> I[CheckValueType]
    C --> J[CheckValueRange]
```

### 6.2 Parameter-Specific Option Validation
```mermaid
graph TD
    A[ParamSpecificOptionValidation] --> B[ValidateForZero]
    A --> C[ValidateForOne]
    A --> D[ValidateForTwo]
    
    B --> E[CheckZeroOptions]
    C --> F[CheckOneOptions]
    D --> G[CheckTwoOptions]
    
    E --> H[ValidateZeroFormat]
    E --> I[ValidateZeroValue]
    
    F --> J[ValidateOneFormat]
    F --> K[ValidateOneValue]
    
    G --> L[ValidateTwoFormat]
    G --> M[ValidateTwoValue]
```

### 6.3 Option Validation Relationships
```mermaid
graph TD
    A[OptionValidation] --> B[CommonValidation]
    A --> C[ParamSpecificValidation]
    
    B --> D[FormatValidation]
    B --> E[ValueValidation]
    
    C --> F[ZeroParamValidation]
    C --> G[OneParamValidation]
    C --> H[TwoParamValidation]
    
    D --> I[CommonFormatRules]
    E --> J[CommonValueRules]
    
    F --> K[ZeroFormatRules]
    F --> L[ZeroValueRules]
    
    G --> M[OneFormatRules]
    G --> N[OneValueRules]
    
    H --> O[TwoFormatRules]
    H --> P[TwoValueRules]
``` 