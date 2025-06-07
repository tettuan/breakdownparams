# Parameter Specifications

## Parameter Type Definitions

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

// Parser configuration type definition
interface ParserConfig {
  // DemonstrativeType configuration
  demonstrativeType: {
    // Pattern for allowed values (regex)
    pattern: string;
    // Custom error message
    errorMessage?: string;
  };

  // LayerType configuration
  layerType: {
    // Pattern for allowed values (regex)
    pattern: string;
    // Custom error message
    errorMessage?: string;
  };
}

// Default configuration values
const DEFAULT_CONFIG: ParserConfig = {
  demonstrativeType: {
    pattern: '^(to|summary|defect)$',
    errorMessage: 'Invalid demonstrative type. Must be one of: to, summary, defect'
  },
  layerType: {
    pattern: '^(project|issue|task)$',
    errorMessage: 'Invalid layer type. Must be one of: project, issue, task'
  }
};
```

## Parameter Patterns

1. **ZeroParams**
   - help command
   - version command

2. Single Parameter (OneParamResult)
   - layer command
   - command name and options

3. Double Parameter (TwoParamResult)
   - break command
   - DemonstrativeType and LayerType validation
   - options

## Option Parameters

```typescript
type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: string;  // Validated against LayerType pattern
  adaptationType?: string;
  configFile?: string;
  customVariables?: Record<string, string>;
};
```

## Error Handling

Each parameter type can have an `error` property containing error information:

```typescript
type ErrorInfo = {
  message: string;
  code: string;
  category: string;
  details?: Record<string, unknown>;
};
```

## Usage Examples

```typescript
// No parameters
const helpResult: ZeroParamResult = {
  type: 'help',
  help: true
};

// Single parameter
const layerResult: OneParamResult = {
  type: 'layer',
  command: 'create',
  options: {
    fromFile: 'input.json'
  }
};

// Double parameter (using default configuration)
const breakResult: TwoParamResult = {
  type: 'break',
  demonstrativeType: 'to',      // Pattern: ^(to|summary|defect)$
  layerType: 'project',         // Pattern: ^(project|issue|task)$
  options: {
    fromFile: 'input.json',
    destinationFile: 'output.json',
    fromLayerType: 'issue'      // Pattern: ^(project|issue|task)$
  }
};

// Example with custom configuration
const customConfig: ParserConfig = {
  demonstrativeType: {
    pattern: '^[a-z]+$',  // Only lowercase letters allowed
    errorMessage: 'Invalid demonstrative type'
  },
  layerType: {
    pattern: '^[a-z]+$',  // Only lowercase letters allowed
    errorMessage: 'Invalid layer type'
  }
};

const parser = new ParamsParser(customConfig);
```

# Parameter Specifications

This document defines the specifications for non-hyphenated parameters (positional arguments).

# Parameter Patterns

Processing branches based on the number of non-hyphenated parameters.
Each pattern corresponds to a specific data structure. These patterns are mutually exclusive.

- Hyphenated options only (0 parameters)
  - Special handling for application help and version display
- Single parameter only
  - Special handling for application initialization
- 2 parameters
  - Main application execution
  - DemonstrativeType and LayerType validation
  - Hyphenated parameters function as additional options
- 3 or more parameters result in an error
- No parameters returns an empty parameter result

# Processing for Each Parameter Pattern

## Hyphenated Options Only (0 Parameters)

Usage example:

```bash
./.deno/bin/breakdown -h
```

### Possible Values

- -h, --help
- -v, --version

Aliases are supported.
Indicates the presence of arguments. Multiple options can be specified simultaneously.

## Single Parameter

Usage example:

```bash
./.deno/bin/breakdown init
```

### Possible Values

- `init`

Indicates what the argument represents.
For example, you can verify that the parameter is `init` during initialization.

## 2 Parameters

Usage pattern:

```bash
./.deno/bin/breakdown $1 $2
```

Example:

```bash
./.deno/bin/breakdown to issue
```

The first option ($1) is called `DemonstrativeType` and is validated against a regex pattern.
The second option ($2) is called `LayerType` and is validated against a regex pattern.

### Default Validation Rules

#### DemonstrativeType
Default regex pattern: `^(to|summary|defect)$`
- to
- summary
- defect

#### LayerType
Default regex pattern: `^(project|issue|task)$`
- project
- issue
- task

### Hyphenated Option Values

#### --from `<file>`

Option name: FromFile
Alias: `-f`
The following are equivalent:

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --from=<file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -f=<file>
```

##### FromFile Value

- Extract the `<file>` portion
- Example: For `--from=./.agent/breakdown/issues/issue_summary.md`, save `./.agent/breakdown/issues/issue_summary.md`

#### --destination `<output_file>`

---

[日本語版](params.ja.md) | [English Version](params.md) 