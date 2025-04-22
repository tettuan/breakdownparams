# Library Overview

This library is registered on https://jsr.io and is used by https://jsr.io/@tettuan/breakdown.
Within the use cases, this library's scope is focused on parameter parsing and storage.

This library parses runtime parameters and stores their values.
Its scope extends from parsing through validation to returning the stored values.

For detailed specifications and available options for each parameter type, please refer to the [Options Documentation](options.md).

## Out of Scope

The library does not:
- Interpret the meaning of parameter values (e.g., "display help because --help was specified")
- Provide default values

# Parameter Patterns

The processing branches based on the number of parameters without hyphens.
Each pattern corresponds to a specific data structure. These patterns are mutually exclusive.

- 0 parameters with hyphenated options
  - Special processing for application help and version display
- 1 parameter only
  - Special processing for application initialization
- 2 parameters
  - Main application execution
  - Hyphenated parameters serve as additional options
- 3 or more parameters result in an error
- No parameters returns an empty parameter result

# Processing for Each Parameter Pattern

## 0 Parameters with Hyphenated Options

Example usage:

```bash
./.deno/bin/breakdown -h
```

### Possible Values

- -h, --help
- -v, --version

Aliases are supported.
Indicates the presence of arguments. Multiple options can be specified simultaneously.

## Single Parameter

Example usage:

```bash
./.deno/bin/breakdown init
```

### Possible Values

- `init`

Indicates what the argument represents.
For example, during initialization, it can be confirmed that the parameter is `init`.

## Two Parameters

Usage pattern:

```bash
./.deno/bin/breakdown $1 $2
```

Example:

```bash
./.deno/bin/breakdown to issue
```

The first option ($1) is referred to as `DemonstrativeType`.
The second option ($2) is referred to as `LayerType`.

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

##### FromFile Value

- Captures the `<file>` portion
- Example: For `--from ./.agent/breakdown/issues/issue_summary.md`, stores `./.agent/breakdown/issues/issue_summary.md`

#### --destination `<output_file>`

Option name: DestinationFile
Alias: `-o`
The following are equivalent:

```bash
./.deno/bin/breakdown <DemonstrativeType> <LayerType> --destination <output_file>
./.deno/bin/breakdown <DemonstrativeType> <LayerType> -o <output_file>
```

##### DestinationFile Value

- Captures the `<output_file>` portion
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

- Captures the `<from_layer_type>` portion
- Example: For `--input issue`, stores `issue`
- Allowed values:
  - project, pj, prj
  - issue, story
  - task, todo, chore, style, fix, error, bug
- Values are normalized to common forms:
  - project, pj, prj -> project
  - issue, story -> issue
  - task, todo, chore, style, fix, error, bug -> task

# Parameter Precedence Rules

- When both shorthand and long form options are specified, the long form takes precedence. The long form is primary, and the shorthand is considered an alias.
- No path processing is performed (values are used as-is)
- Aliases must be lowercase (uppercase variants are not processed and are ignored without error)
- Undefined aliases are treated as if they weren't specified (ignored without error) 