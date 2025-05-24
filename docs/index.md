# Library Overview

This library is registered at https://jsr.io and is used by https://jsr.io/@tettuan/breakdown.
In the use case, this library's scope focuses on parameter parsing and storage.

This library parses runtime parameters and stores their values.
The scope covers from parsing to validation and returning stored values.

For detailed specifications, please refer to the following documents:

- [Parameter Specification](params.md) - Definition and constraints of positional arguments
- [Options Specification](options.md) - Definition and constraints of hyphenated arguments
- [Custom Variable Options Specification](custom_variable_options.md) - Definition and constraints of user-defined variables
- [Parameter Parser Type Definition Specification](params_type.md) - Definition and usage of return types

## Out of Scope

This library does not provide the following features:

- Interpretation of parameter value meanings (e.g., "display help because --help was specified")
- Default value provision
- Validation of custom variable option values (syntax check only)

# Parameter Patterns

Processing branches based on the number of parameters without hyphens.
Each pattern corresponds to a specific data structure. These patterns are mutually exclusive.

- Hyphenated options only (0 parameters)
  - Special handling for application help and version display
- Single parameter only
  - Special handling for application initialization
- 2 parameters
  - Main application execution
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

The first option ($1) is called `DemonstrativeType`.
The second option ($2) is called `LayerType`.

### Possible DemonstrativeType Values

- to
- summary
- defect

### Possible LayerType Values

- project
- issue
- task

### Hyphenated Option Values

#### --from `<file>`

Option name: FromFile
Alias: `-f`
The following are equivalent:

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --from <file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -f <file>
```

##### FromFile Values

- Gets the `<file>` part
- Example: For `--from ./.agent/breakdown/issues/issue_summary.md`, stores `./.agent/breakdown/issues/issue_summary.md`

#### --destination `<output_file>`

Option name: DestinationFile
Alias: `-o`
The following are equivalent:

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --destination <output_file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -o <output_file>
```

##### DestinationFile Values

- Gets the `<output_file>` part
- Example: For `--destination ./.agent/breakdown/issues/issue_summary.md`, stores `./.agent/breakdown/issues/issue_summary.md`

#### --input `<from_layer_type>`

Option name: FromLayerType
Alias: `-i`
The following are equivalent:

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --input <from_layer_type>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -i <from_layer_type>
```

##### from_layer_type Values

- Gets the `<from_layer_type>` part
- Example: For `--input issue`, stores `issue`
- Allowed values:
  - project
  - issue
  - task

#### --config `<config_file>`

Option name: ConfigFile
Alias: `-c`
The following are equivalent:

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --config <config_file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -c <config_file>
```

##### ConfigFile Values

- Gets the `<config_file>` part
- Example: For `--config test`, stores `test`

#### Custom Variable Options (`--uv-*`)

Custom variable options are used to specify user-defined variables.
Only available in DoubleParams mode, specified in the following format:

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --uv-<name>=<value>
```

Examples:
```bash
./.deno/bin/breakdown to project --uv-project=myproject
./.deno/bin/breakdown to project --uv-version=1.0.0 --uv-environment=production
```

For detailed specifications, please refer to the [Custom Variable Options Specification](custom_variable_options.md).

# Parameter Priority Rules

- When both short and long form options are specified, the long form takes precedence. The long form is primary, and the short form is considered an alias.
- No path processing is performed (values are used as is)
- Aliases must be lowercase (uppercase variants are not processed and are ignored without error)
- Undefined aliases are treated as if not specified (ignored without error)

---

[日本語版](index.ja.md) | [English Version](index.md) 