# Parameter Type Definitions

## Basic Types

```typescript
type ParamPatternResult = ZeroParamResult | OneParamResult | TwoParamResult;

type ZeroParamResult = {
  type: 'help' | 'version';
  help?: boolean;
  version?: boolean;
  error?: ErrorInfo;
};

type OneParamResult = {
  type: 'layer';
  command: string;
  options: OptionParams;
  error?: ErrorInfo;
};

type TwoParamResult = {
  type: 'break';
  demonstrativeType: string;
  layerType: string;
  options: OptionParams;
  error?: ErrorInfo;
};
```

## Usage Examples

```typescript
// Returns ZeroParamResult
const helpResult: ZeroParamResult = {
  type: 'help',
  help: true
};

// Returns OneParamResult
const layerResult: OneParamResult = {
  type: 'layer',
  command: 'create',
  options: {
    fromFile: 'input.json'
  }
};

// Returns TwoParamResult
const breakResult: TwoParamResult = {
  type: 'break',
  demonstrativeType: 'type1',
  layerType: 'layer1',
  options: {
    fromFile: 'input.json',
    destinationFile: 'output.json'
  }
};
```

## Type Characteristics

1. Type definitions based on parameter patterns
   - `ZeroParamResult`: No parameters (help/version)
   - `OneParamResult`: Single parameter (layer command)
   - `TwoParamResult`: Double parameters (break command)

2. Type safety assurance
   - Required properties for each pattern
   - Clear definition of optional properties
   - Unified error information handling

3. Extensibility considerations
   - Maintain parameter types (ZeroParamResult, OneParamResult, TwoParamResult)
   - Easy addition of new patterns
   - Maintain compatibility with existing types

## Return Types for Option Errors

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
- Error information is kept as the error property of each parameter type
- No type conversion is performed

## Notes

1. **Type Consistency**
   - Maintain type consistency within each branch
   - Minimize type conversions

2. **Error Handling**
   - Handle errors within each parameter type
   - Maintain type consistency even during errors

3. **Type Checking**
   - Ensure runtime type checking
   - Prevent type mismatches

---

[日本語版](params_type.ja.md) | [English Version](params_type.md) 