# Parameter Extension Specification

This document defines the specification for parameter extension functionality in the breakdownparams library.

## 1. Overview

The parameter extension functionality extends the standard validation rules for DemonstrativeType and LayerType.
In extended mode, custom validation rules can be applied in addition to the standard validation rules.

## 2. Extension Scope

### 2.1 Extensible Items

1. **DemonstrativeType**
   - Standard values: `to`, `summary`, `defect`
   - Extensible values: Specified in configuration

2. **LayerType**
   - Standard values: `project`, `issue`, `task`
   - Extensible values: Specified in configuration

### 2.2 Non-extensible Items

The following features are not subject to extension:

- Parameter parsing process
- Option processing
- Return value types
- Basic error handling structure

## 3. Configuration Values

### 3.1 Configuration Structure

```typescript
interface ParserConfig {
  // Enable/disable extended mode
  isExtendedMode: boolean;

  // DemonstrativeType extension settings
  demonstrativeType?: {
    // Allowed value pattern (regular expression)
    pattern: string;
    // Custom error message
    errorMessage?: string;
  };

  // LayerType extension settings
  layerType?: {
    // Allowed value pattern (regular expression)
    pattern: string;
    // Custom error message
    errorMessage?: string;
  };
}
```

### 3.2 Configuration Examples

```typescript
// Extended mode configuration example
const config: ParserConfig = {
  isExtendedMode: true,
  demonstrativeType: {
    pattern: '^[a-z]+$',
    errorMessage: 'Invalid demonstrative type',
  },
  layerType: {
    pattern: '^[a-z]+$',
    errorMessage: 'Invalid layer type',
  },
};
```

## 4. Validation Process

### 4.1 Standard Mode

In standard mode, only the following values are allowed:

- DemonstrativeType: `to`, `summary`, `defect`
- LayerType: `project`, `issue`, `task`

### 4.2 Extended Mode

In extended mode, values matching the pattern specified in the configuration are allowed:

1. **DemonstrativeType Validation**
   - Check if value matches the configured pattern
   - Return custom error message if no match

2. **LayerType Validation**
   - Check if value matches the configured pattern
   - Return custom error message if no match

## 5. Usage Examples

### 5.1 Parser Initialization

```typescript
import { ParamsParser } from './mod.ts';

// Initialize parser in extended mode
const config: ParserConfig = {
  isExtendedMode: true,
  demonstrativeType: {
    pattern: '^[a-z]+$',
  },
  layerType: {
    pattern: '^[a-z]+$',
  },
};

const parser = new ParamsParser(config);
```

### 5.2 Parameter Parsing

```typescript
// Usage similar to standard mode
const result = parser.parse(['custom', 'layer']);

if (result.type === 'one') {
  console.log(result.demonstrativeType); // "custom"
  console.log(result.layerType); // "layer"
}
```

## 6. Error Handling

### 6.1 Error Types

1. **Validation Errors**
   - Pattern mismatch
   - Return custom error message

2. **Configuration Errors**
   - Invalid configuration values
   - Extension settings when extended mode is disabled

### 6.2 Error Messages

```typescript
// Validation error example
{
  type: "one",
  error: {
    message: "Invalid demonstrative type: custom",
    code: "INVALID_DEMONSTRATIVE_TYPE"
  }
}

// Configuration error example
{
  type: "one",
  error: {
    message: "Invalid configuration: pattern is required in extended mode",
    code: "INVALID_CONFIGURATION"
  }
}
```

For detailed type definitions and usage, please refer to the [Parameter Parser Type Definition Specification](params_type.md).

## 7. Constraints

1. **Pattern Constraints**
   - Must be valid regular expressions
   - Avoid overly complex patterns

2. **Performance**
   - Patterns should be pre-compiled
   - Complex patterns have runtime overhead

3. **Security**
   - Patterns should be appropriately restricted
   - Avoid direct use of user input

## 8. Migration Guide

### 8.1 Migration from Standard to Extended Mode

1. Prepare configuration values
   - Define required patterns
   - Prepare error messages

2. Initialize parser
   - Enable extended mode
   - Apply configuration values

3. Verify existing code
   - Check error handling
   - Verify return value types

### 8.2 Migration from Extended to Standard Mode

1. Disable configuration values
   - Set `isExtendedMode: false`
   - Remove extension settings

---

[日本語版](custom_params.ja.md) | [English Version](custom_params.md) 