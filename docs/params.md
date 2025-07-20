# Parameter Specification

## Option Normalization Rules

The library applies consistent normalization rules to all options:
- Leading hyphens are removed from the canonical form
- Aliases are resolved to primary names
- Examples:
  - `--help` → `help`
  - `-h` → `help`
  - `--uv-config` → `uv-config`

## Parameter Type Definitions

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

// Parser configuration type definition
interface ParserConfig {
  // DirectiveType configuration
  directiveType: {
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
  directiveType: {
    pattern: '^(to|summary|defect)$',
    errorMessage: 'Invalid directive type. Must be one of: to, summary, defect'
  },
  layerType: {
    pattern: '^(project|issue|task)$',
    errorMessage: 'Invalid layer type. Must be one of: project, issue, task'
  }
};
```

## Parameter Patterns

1. **ZeroParams**
   - No parameters
   - Options only (--help, --version, etc.)

2. Single Parameter (OneParamsResult)
   - init command
   - directiveType only (options are ignored)

3. Two Parameters (TwoParamsResult)
   - Main application execution
   - DirectiveType and LayerType validation
   - Options and user variables

## Option Parameters

```typescript
type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: string;  // Validated with LayerType pattern
  adaptationType?: string;
  configFile?: string;
  [key: `uv-${string}`]?: string; // User variables are normalized by removing leading hyphens
};
```

## Error Handling

Each parameter type has an `error` property that can contain error information:

```typescript
type ErrorInfo = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};
```

## Usage Examples

```typescript
// No parameters
const zeroResult: ZeroParamsResult = {
  type: 'zero',
  options: {
    help: true
  }
};

// Single parameter
const oneResult: OneParamsResult = {
  type: 'one',
  directiveType: 'init'
};

// Two parameters (using default configuration values)
const twoResult: TwoParamsResult = {
  type: 'two',
  directiveType: 'to',      // Pattern: ^(to|summary|defect)$
  layerType: 'project',         // Pattern: ^(project|issue|task)$
  options: {
    fromFile: 'input.json',
    destinationFile: 'output.json',
    fromLayerType: 'issue'      // Pattern: ^(project|issue|task)$
  }
};

// Custom configuration values usage example
const customConfig: ParserConfig = {
  directiveType: {
    pattern: '^[a-z]+$',  // Allow only lowercase alphabets
    errorMessage: 'Invalid directive type'
  },
  layerType: {
    pattern: '^[a-z]+$',  // Allow only lowercase alphabets
    errorMessage: 'Invalid layer type'
  }
};

const parser = new ParamsParser(customConfig);
```

# Parameter Specification

This document defines the specification for parameters without hyphens (positional arguments).

# Parameter Patterns

Processing branches based on the number of parameters without hyphens.
Each pattern corresponds to a specific data structure. These patterns are mutually exclusive.

- Hyphenated options only (0 parameters)
  - Special handling for application help and version display
- Single parameter only
  - Special handling for application initialization
- 2 parameters
  - Main application execution
  - DirectiveType and LayerType validation
  - Hyphenated parameters function as additional options
- 3 or more parameters result in an error

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

The first option ($1) is called `DirectiveType` and is validated with a regex pattern.
The second option ($2) is called `LayerType` and is validated with a regex pattern.

### Default Validation Rules

#### DirectiveType
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
./.deno/bin/breakdown <DirectiveType> <LayerType> --from=<file>
./.deno/bin/breakdown <DirectiveType> <LayerType> -f=<file>
```

##### FromFile Values

- Gets the `<file>` part
- Example: For `--from=./.agent/breakdown/issues/issue_summary.md`, stores `./.agent/breakdown/issues/issue_summary.md`

#### --destination `<output_file>`

Option name: DestinationFile
Alias: `-o`
The following are equivalent:

```bash
./.deno/bin/breakdown <DirectiveType> <LayerType> --destination=<output_file>
./.deno/bin/breakdown <DirectiveType> <LayerType> -o=<output_file>
```

##### DestinationFile Values

- Gets the `<output_file>` part
- Example: For `--destination=./.agent/breakdown/issues/issue_summary.md`, stores `./.agent/breakdown/issues/issue_summary.md`

#### --input `<from_layer_type>`

Option name: FromLayerType
Alias: `-i`
The following are equivalent:

```bash
./.deno/bin/breakdown <DirectiveType> <LayerType> --input=<from_layer_type>
./.deno/bin/breakdown <DirectiveType> <LayerType> -i=<from_layer_type>
```

##### from_layer_type Values

- Gets the `<from_layer_type>` part
- Example: For `--input=issue`, stores `issue`
- Default regex pattern: `^(project|issue|task)$`

#### --config `<config_file>`

Option name: ConfigFile
Alias: `-c`
The following are equivalent:

```bash
./.deno/bin/breakdown <DirectiveType> <LayerType> --config=<config_file>
./.deno/bin/breakdown <DirectiveType> <LayerType> -c=<config_file>
```

##### ConfigFile Values

- Gets the `<config_file>` part
- Example: For `--config=test`, stores `test`

#### User Variable Options (`--uv-*`)

User variable options are used to specify user-defined variables.
Only available in TwoParams mode, specified in the following format:

```bash
./.deno/bin/breakdown <DirectiveType> <LayerType> --uv-<name>=<value>
```

## Error Cases

| Error Case              | Example Message                                           |
| ----------------------- | --------------------------------------------------------- |
| Too many arguments      | "Too many arguments. Maximum 2 arguments are allowed."    |
| Invalid DirectiveType | "Invalid directive type. Must be one of: to, summary, defect" |
| Invalid LayerType       | "Invalid layer type. Must be one of: project, issue, task" |
| Invalid Config usage    | "Config option is only available with TwoParams"          |

## Return Type

The parameter parsing result is returned with the following type:

```typescript
type ParamsResult = ZeroParamsResult | OneParamsResult | TwoParamsResult | ErrorResult;
```

---

[日本語版](params.ja.md) | [English Version](params.md)