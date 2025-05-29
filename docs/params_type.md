# Parameter Parser Type Definition Specification

## Overview

The parameter parser (`ParamsParser`) is a class that parses command line arguments and returns type-safe results.
This specification defines the type definitions and parsing flow of the parameter parser.

## Type Hierarchy

### 1. Basic Types

```typescript
type ParamsResult = ZeroParamsResult | OneParamResult | TwoParamsResult;

// Error information type
type ErrorResult = {
  message: string;
  code: string;
};
```

### 2. Type Definitions

#### 2.1 Types by Parameter Count
```typescript
// No arguments
type ZeroParamsResult = {
  type: 'zero-params';
  help: boolean;
  version: boolean;
  error?: ErrorResult;  // Set when parameter or option error occurs
};

// One argument
type OneParamResult = {
  type: 'one';
  command: 'init';
  options: OptionParams;
  error?: ErrorResult;  // Set when parameter or option error occurs
};

// Two arguments
type TwoParamsResult = {
  type: 'two';
  demonstrativeType: DemonstrativeType;
  layerType: LayerType;
  options: OptionParams;
  error?: ErrorResult;  // Set when parameter or option error occurs
};
```

#### 2.2 Option Types
```typescript
type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
  adaptationType?: string;
  configFile?: string;
  customVariables?: Record<string, string>;
};
```

## Parsing Flow

### 1. Parameter Parsing

1. **Branching by Argument Count**
   ```typescript
   if (nonOptionArgs.length === 0) {
     // Return ZeroParamsResult
   } else if (nonOptionArgs.length === 1) {
     // Parameter validation
     if (!isValidCommand(nonOptionArgs[0])) {
       return {
         type: 'one',
         command: 'init',
         options: {},
         error: {
           message: `Invalid command: ${nonOptionArgs[0]}`,
           code: 'INVALID_COMMAND'
         }
       };
     }
     // Return OneParamResult
   } else if (nonOptionArgs.length === 2) {
     // Parameter validation
     if (!isValidDemonstrativeType(nonOptionArgs[0])) {
       return {
         type: 'two',
         demonstrativeType: '...',
         layerType: '...',
         options: {},
         error: {
           message: `Invalid demonstrative type: ${nonOptionArgs[0]}`,
           code: 'INVALID_DEMONSTRATIVE_TYPE'
         }
       };
     }
     // Return TwoParamsResult
   }
   ```

2. **Processing in Each Branch**
   - Parameter validation
   - Type determination
   - Option parsing preparation

### 2. Option Parsing

1. **Execute Option Parsing**
   ```typescript
   const options = this.parseOptions(args);
   if ('error' in options) {
     // Maintain current parameter type and set error property when error occurs
     return {
       ...currentParamResult,
       error: {
         message: options.error,
         code: 'INVALID_OPTION'
       }
     };
   }
   ```

2. **Option Types**
   - Standard options (--from, --destination, etc.)
   - Custom variable options (--uv-*)

### 3. Return Type Determination

1. **Normal Case**
   - Maintain parameter type
   - Add option information

2. **Error Case**
   - Maintain parameter type
   - Add error information as error property

## Return Type for Option Errors

### 1. Return Type Determination

When an error occurs in parameters or options, the error information is set in the error property while maintaining the parameter type:

```typescript
// Example: Parameter error
{
  type: 'two',
  demonstrativeType: '...',
  layerType: '...',
  options: {},
  error: {
    message: 'Invalid demonstrative type: invalid-type',
    code: 'INVALID_DEMONSTRATIVE_TYPE'
  }
}

// Example: Option error
{
  type: 'two',
  demonstrativeType: '...',
  layerType: '...',
  options: {},
  error: {
    message: 'Invalid option: --invalid-option',
    code: 'INVALID_OPTION'
  }
}
```

### 2. Return Type Examples

```typescript
// Example 1: Parameter error (invalid command)
{
  type: 'one',
  command: 'init',
  options: {},
  error: {
    message: 'Invalid command: invalid-command',
    code: 'INVALID_COMMAND'
  }
}

// Example 2: Parameter error (invalid layer type)
{
  type: 'two',
  demonstrativeType: '...',
  layerType: '...',
  options: {},
  error: {
    message: 'Invalid layer type: invalid-layer',
    code: 'INVALID_LAYER_TYPE'
  }
}

// Example 3: Option error (custom variable naming rule violation)
{
  type: 'one',
  command: 'init',
  options: {},
  error: {
    message: 'Invalid custom variable name: invalid@name',
    code: 'INVALID_CUSTOM_VARIABLE'
  }
}
```

### 3. Type Consistency

- Maintain parameter types (ZeroParamsResult, OneParamResult, TwoParamsResult)
- Error information is kept as error property of each parameter type
- No type conversion is performed

## Usage Examples

```typescript
const parser = new ParamsParser();
const result = parser.parse(args);

if (result.type === 'zero-params') {
  if (result.error) {
    // Error handling
    console.error(`Error ${result.error.code}: ${result.error.message}`);
  } else {
    // Normal processing
  }
} else if (result.type === 'one') {
  if (result.error) {
    // Error handling
    console.error(`Error ${result.error.code}: ${result.error.message}`);
  } else {
    // Normal processing
  }
} else if (result.type === 'two') {
  if (result.error) {
    // Error handling
    console.error(`Error ${result.error.code}: ${result.error.message}`);
  } else {
    // Normal processing
  }
}
```

## Notes

1. **Type Consistency**
   - Maintain type consistency within each branch
   - Minimize type conversions 

## Error Handling and Options Persistence

### 1. Error Handling Strategy

The parameter parser maintains a debug-friendly approach to error handling:

```typescript
// Example of error result with preserved options
type ParseResult<T> = {
  success: false;
  error: ErrorResult;
  data?: T;  // Contains parsed options even when validation fails
};
```

### 2. Options Persistence

- Even when validation fails (`success: false`), the parser preserves the parsed options
- This design choice enables:
  - Easier debugging by maintaining the state at the time of error
  - Better user experience by allowing partial corrections
  - Flexible error handling in the application layer

### 3. Security Considerations

While maintaining options during errors is beneficial for debugging, be aware that:
- Invalid or potentially malicious data may be preserved
- Sensitive information in options should be handled with care
- Application layer should implement appropriate security checks

---

[日本語版](params_type.ja.md) | [English Version](params_type.md) 