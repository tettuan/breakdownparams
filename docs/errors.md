# Error Specifications

This document defines the error handling specifications for the breakdownparams library.

## 1. Error Types

Errors are categorized into the following categories:

1. **Validation Errors**
   - When parameter values don't meet constraints
   - When option formats are invalid
   - When custom variable option syntax is invalid

2. **Configuration Errors**
   - When parser configuration is invalid
   - When regex patterns are invalid
   - When required configuration values are missing

3. **Security Errors**
   - Command injection detection
   - Invalid character detection

## 2. Error Codes and Messages

### 2.1 Validation Errors

| Error Code | Message | Description |
|------------|---------|-------------|
| INVALID_DEMONSTRATIVE_TYPE | "Invalid demonstrative type. Must be one of: to, summary, defect" | DemonstrativeType value doesn't meet constraints |
| INVALID_LAYER_TYPE | "Invalid layer type. Must be one of: project, issue, task" | LayerType value doesn't meet constraints |
| INVALID_OPTION_FORMAT | "Invalid option format. Must be in the form: --key=value" | Invalid option format |
| INVALID_CUSTOM_VARIABLE | "Invalid custom variable option syntax: {value}" | Invalid custom variable option syntax |
| TOO_MANY_ARGUMENTS | "Too many arguments. Maximum 2 arguments are allowed." | Number of arguments exceeds limit |
| MISSING_REQUIRED_PARAM | "Missing required parameter: {param}" | Required parameter is missing |

### 2.2 Configuration Errors

| Error Code | Message | Description |
|------------|---------|-------------|
| INVALID_PATTERN | "Invalid regex pattern: {pattern}" | Invalid regex pattern |
| MISSING_PATTERN | "Pattern is required for {type}" | Required pattern configuration is missing |
| INVALID_CONFIG | "Invalid configuration: {reason}" | Invalid configuration value |

### 2.3 Security Errors

| Error Code | Message | Description |
|------------|---------|-------------|
| COMMAND_INJECTION | "Potential command injection detected" | Potential command injection detected |
| INVALID_CHARACTERS | "Invalid characters detected in input" | Invalid characters detected in input |

## 3. Error Result Structure

```typescript
interface ErrorResult {
  type: "error";
  error: {
    code: string;
    message: string;
    details?: {
      param?: string;
      value?: string;
      pattern?: string;
      reason?: string;
    };
  };
}
```

## 4. Error Handling Flow

1. **Error Detection**
   - Detect errors during validation
   - Detect errors during configuration verification
   - Detect errors during security checks

2. **Error Information Construction**
   - Set error code
   - Generate error message
   - Add details if necessary

3. **Error Result Return**
   - Create ErrorResult object
   - Set error information
   - Return to caller

## 5. Error Handling Examples

### 5.1 Validation Errors

```typescript
// Invalid DemonstrativeType
{
  type: "error",
  error: {
    code: "INVALID_DEMONSTRATIVE_TYPE",
    message: "Invalid demonstrative type. Must be one of: to, summary, defect",
    details: {
      value: "invalid"
    }
  }
}

// Invalid option format
{
  type: "error",
  error: {
    code: "INVALID_OPTION_FORMAT",
    message: "Invalid option format. Must be in the form: --key=value",
    details: {
      value: "--from=input.md"
    }
  }
}
```

### 5.2 Configuration Errors

```typescript
// Invalid regex pattern
{
  type: "error",
  error: {
    code: "INVALID_PATTERN",
    message: "Invalid regex pattern: [invalid",
    details: {
      pattern: "[invalid"
    }
  }
}

// Missing configuration value
{
  type: "error",
  error: {
    code: "MISSING_PATTERN",
    message: "Pattern is required for demonstrativeType",
    details: {
      type: "demonstrativeType"
    }
  }
}
```

## 6. Error Handling Constraints

1. **Error Message Consistency**
   - Error messages must be clear and specific
   - Must indicate cause and solution
   - Must maintain consistent format

2. **Error Code Naming Rules**
   - Use uppercase snake case
   - Clearly indicate error type
   - Must be unique

3. **Detail Information**
   - Include details only when necessary
   - Must not contain sensitive information
   - Must provide information useful for debugging

## 7. Error Handling Best Practices

1. **Early Error Detection**
   - Detect errors as early as possible
   - Minimize error propagation

2. **Appropriate Error Level**
   - Set appropriate level based on error importance
   - Avoid unnecessary errors

3. **Error Aggregation**
   - Properly aggregate related errors
   - Avoid error duplication

4. **Error Recovery**
   - Provide recovery processing when possible
   - Provide appropriate guidance to users

---

[日本語版](errors.ja.md) | [English Version](errors.md) 