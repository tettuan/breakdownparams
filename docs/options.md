# Options Specification

This document defines the specification for options (hyphenated arguments) in the breakdownparams library.

## Option Class Architecture

The library adopts an option-class-centered design where each option instance holds its own normalization, validation, and transformation logic. This design promotes:

- **Single Responsibility**: Each option class manages its own behavior
- **Consistency**: Unified normalization rules across the system
- **Extensibility**: Easy addition of new option types
- **Encapsulation**: Internal representation separated from external interface

## Argument Format

Option arguments must follow the format below:

### Correct Format
- `--option=value` (long form)
- `-o=value` (short form)
- `--option=` (empty value)
- `--option=""` (empty string)
- `--option=''` (empty string)

### Incorrect Format
- `--option value` (space-separated not supported)
- `-o value` (space-separated not supported)

### Empty Value Specification
To specify an empty value for an option, use one of the following methods:

1. Specify only the equals sign:
   ```bash
   --option=
   ```

2. Specify an empty string:
   ```bash
   --option=""
   --option=''
   ```

## Option List

| Option        | Alias | Description          | Value Type | Required | Example                    |
| ------------- | ----- | -------------------- | ---------- | -------- | -------------------------- |
| --help        | -h    | Display help info    | boolean    | No       | `--help`                   |
| --version     | -v    | Display version info | boolean    | No       | `--version`                |
| --from        | -f    | Source file path     | string     | No       | `--from=input.md`          |
| --destination | -o    | Output file path     | string     | No       | `--destination=output.md`  |
| --edition     | -e    | Edition layer type   | enum       | No       | `--edition=project`        |
| --adaptation  | -a    | Prompt adaptation type | string  | No       | `--adaptation=strict`      |
| --config      | -c    | Configuration file   | string     | No       | `--config=test`            |
| --uv-*        | None  | User variable option | string   | No       | `--uv-project=myproject`   |

## Option Constraints

1. **Long and Short Forms**
   - When both forms are provided (e.g., `--from` and `-f`), the long form takes precedence
   - Long form is primary, and short form is considered an alias
   - User variable options (`--uv-*`) do not support short forms

2. **Case Sensitivity**
   - All options and aliases must be lowercase
   - Uppercase variants are ignored without error
   - User variable option names are case sensitive and must be used as specified

3. **Invalid Options**
   - Undefined options are ignored without error
   - No validation is performed on file paths
   - Invalid syntax for user variable options (e.g., missing `=`) results in an error

4. **Parameter Type Constraints**
   - `--config` / `-c` option is only available in TwoParams mode
   - User variable options (`--uv-*`) are also only available in TwoParams mode
   - Ignored in other parameter types (ZeroParams, OneParam, TwoParams)

## Input Layer Type Values

When using the `--edition` option, the validation rules for the second parameter are used:

## Usage Examples

### Help and Version

```bash
breakdown --help
breakdown -v
```

### File Operations

```bash
# Correct format
breakdown to issue --from=input.md --destination=output.md
breakdown to issue -f=input.md -o=output.md

# Empty value examples
breakdown to issue --from= --destination=""
breakdown to issue -f='' -o=
```

### Layer Type Specification

```bash
# Correct format
breakdown summary task --edition=project
breakdown summary task -e=project

# Empty value examples
breakdown summary task --edition=
breakdown summary task -e=""
```

### Prompt Adaptation

```bash
# Correct format
breakdown summary task --adaptation=strict
breakdown summary task -a=strict

# Empty value examples
breakdown summary task --adaptation=
breakdown summary task -a=''
```

### User Variable Options

```bash
# Correct format
breakdown to project --uv-project=myproject
breakdown to project --uv-version=1.0.0 --uv-environment=production

# Empty value examples
breakdown to project --uv-project= --uv-version=""
```

### Combined Usage

```bash
# Correct format
breakdown to issue --from=input.md -o=output.md -e=project -a=strict
breakdown to project --config=test
breakdown summary task -c=test
breakdown to project --config=test --uv-environment=prod --uv-version=1.0.0

# Examples with empty values
breakdown to issue --from= -o="" -e=project -a=
breakdown to project --config= --uv-environment="" --uv-version=
```

## Option Normalization

The library uses a unified normalization approach:
- Short options (`-h`) are internally normalized to their canonical names (`help`)
- Long options (`--help`) are also normalized to canonical names (`help`)
- User variable options (`--uv-config`) are normalized to `uv-config` (removing leading hyphens)
- Each option class handles its own normalization logic

## Return Type

The option parsing result is included in the parameter type:

```typescript
type OptionParams = {
  fromFile?: string;
  destinationFile?: string;
  fromLayerType?: LayerType;
  adaptationType?: string;
  configFile?: string;
  [key: `uv-${string}`]: string; // User variables normalized without leading hyphens
};
```

For detailed type definitions and usage, please refer to the [Parameter Parser Type Definition Specification](params_type.md).

---

[日本語版](options.ja.md) | [English Version](options.md) 