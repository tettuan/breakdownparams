# Parameter Type Definitions

## Basic Types

```typescript
type ParamsResult = ZeroParamsResult | OneParamsResult | TwoParamsResult | ErrorResult;

type ZeroParamsResult = {
  type: 'zero';
  options: OptionParams;
};

type OneParamsResult = {
  type: 'one';
  directiveType: string;
};

type TwoParamsResult = {
  type: 'two';
  directiveType: string;
  layerType: string;
  options: OptionParams;
  userVariables?: UserVariables;
};

type ErrorResult = {
  type: 'error';
  error: ErrorInfo;
};

type ErrorInfo = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};

type OptionParams = {
  help?: boolean;
  version?: boolean;
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: string;
  adaptationType?: string;
  configFile?: string;
};

type UserVariables = {
  [key: `uv-${string}`]: string;
};
```

## Usage Examples

```typescript
// ZeroParamsResult return
const zeroResult: ZeroParamsResult = {
  type: 'zero',
  options: {
    help: true
  }
};

// OneParamsResult return
const oneResult: OneParamsResult = {
  type: 'one',
  directiveType: 'init'
};

// TwoParamsResult return
const twoResult: TwoParamsResult = {
  type: 'two',
  directiveType: 'to',
  layerType: 'project',
  options: {
    fromFile: 'input.json',
    destinationFile: 'output.json'
  },
  userVariables: {
    'uv-project': 'myproject',
    'uv-version': '1.0.0'
  }
};

// ErrorResult return
const errorResult: ErrorResult = {
  type: 'error',
  error: {
    message: 'Invalid directive type: invalid-type',
    code: 'INVALID_DIRECTIVE_TYPE',
    details: {
      value: 'invalid-type',
      expected: 'to, summary, or defect'
    }
  }
};
```

## Type Features

1. Type definitions based on parameter patterns
   - `ZeroParamsResult`: No parameters (options only)
   - `OneParamsResult`: Single parameter (init command)
   - `TwoParamsResult`: Two parameters (main application execution)
   - `ErrorResult`: Error result

2. Type safety guarantee
   - Required properties for each pattern
   - Clear definition of optional properties
   - Unified handling of error information

3. Extensibility considerations
   - Clearly distinguished result types
   - Easy addition of new patterns
   - Maintains compatibility with existing types

## Type Details

### ZeroParamsResult

Result type when executed with no parameters. Only options can be specified.

- `type`: Always `'zero'`
- `options`: Specified options (help, version, etc.)

### OneParamsResult

Result type when executed with a single parameter. Currently only supports `init` command.

- `type`: Always `'one'`
- `directiveType`: Specified command (usually `'init'`)

**Note**: Options are ignored in OneParamsResult.

### TwoParamsResult

Result type when executed with two parameters. Used for main application execution.

- `type`: Always `'two'`
- `directiveType`: First parameter (e.g., `'to'`, `'summary'`, `'defect'`)
- `layerType`: Second parameter (e.g., `'project'`, `'issue'`, `'task'`)
- `options`: Specified options
- `userVariables`: User variable options (`--uv-*` format)

### ErrorResult

Result type when an error occurs.

- `type`: Always `'error'`
- `error`: Error information
  - `message`: Error message
  - `code`: Error code
  - `details`: Additional error details (optional)

## Option Normalization

All options are returned in normalized form:

- Long options: `--help` → `help: true`
- Short options: `-h` → `help: true`
- Options with values: `--from=file.txt` → `fromFile: 'file.txt'`
- User variables: `--uv-config=value` → `userVariables: { 'uv-config': 'value' }`

## Error Codes

Main error codes:

- `INVALID_DIRECTIVE_TYPE`: Invalid directiveType
- `INVALID_LAYER_TYPE`: Invalid layerType
- `INVALID_OPTION`: Invalid option
- `INVALID_USER_VARIABLE`: Invalid user variable
- `TOO_MANY_ARGUMENTS`: Too many arguments
- `INVALID_COMMAND`: Invalid command

## Notes

1. **Type Discrimination**
   - Use the `type` field to discriminate result types
   - Leverage TypeScript's type guard features

2. **Error Handling**
   - All errors are returned as `ErrorResult`
   - Error details can be checked in `error.details`

3. **Option Handling**
   - Options are ignored in OneParamsResult
   - All options are valid only in TwoParamsResult

---

[日本語版](params_type.ja.md) | [English Version](params_type.md)