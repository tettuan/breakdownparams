# Options Specification

This document defines the specification for options (hyphenated arguments) in the breakdownparams library.

## Option List

| Option        | Alias | Description          | Value Type | Required | Example                    |
| ------------- | ----- | -------------------- | ---------- | -------- | -------------------------- |
| --help        | -h    | Display help info    | boolean    | No       | `--help`                   |
| --version     | -v    | Display version info | boolean    | No       | `--version`                |
| --from        | -f    | Source file path     | string     | No       | `--from input.md`          |
| --destination | -o    | Output file path     | string     | No       | `--destination output.md`  |
| --input       | -i    | Input layer type     | enum       | No       | `--input project`          |
| --adaptation  | -a    | Prompt adaptation type | string  | No       | `--adaptation strict`      |
| --config      | -c    | Configuration file   | string     | No       | `--config test`            |
| --uv-*        | None  | Custom variable option | string   | No       | `--uv-project=myproject`   |

## Option Constraints

1. **Long and Short Forms**
   - When both forms are provided (e.g., `--from` and `-f`), the long form takes precedence
   - Long form is primary, and short form is considered an alias
   - Custom variable options (`--uv-*`) do not support short forms

2. **Case Sensitivity**
   - All options and aliases must be lowercase
   - Uppercase variants are ignored without error
   - Custom variable option names are case sensitive and must be used as specified

3. **Invalid Options**
   - Undefined options are ignored without error
   - No validation is performed on file paths
   - Invalid syntax for custom variable options (e.g., missing `=`) results in an error

4. **Parameter Type Constraints**
   - `--config` / `-c` option is only available in TwoParams mode
   - Custom variable options (`--uv-*`) are also only available in TwoParams mode
   - Ignored in other parameter types (ZeroParams, OneParam, TwoParams)

## Input Layer Type Values

When using the `--input` option, the following values are supported:

| Input Value | Description |
| ----------- | ----------- |
| project     | Project     |
| issue       | Issue       |
| task        | Task        |

## Usage Examples

### Help and Version

```bash
breakdown --help
breakdown -v
```

### File Operations

```bash
breakdown to issue --from input.md --destination output.md
breakdown to issue -f input.md -o output.md
```

### Layer Type Specification

```bash
breakdown summary task --input project
breakdown summary task -i project
```

### Prompt Adaptation

```bash
breakdown summary task --adaptation strict
breakdown summary task -a strict
```

### Custom Variable Options

```bash
breakdown to project --uv-project=myproject
breakdown to project --uv-version=1.0.0 --uv-environment=production
```

### Combined Usage

```bash
breakdown to issue --from input.md -o output.md -i project -a strict
breakdown to project --config test
breakdown summary task -c test
breakdown to project --config test --uv-environment=prod --uv-version=1.0.0
```

## Return Type

The option parsing result is included in the parameter type:

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

For detailed type definitions and usage, please refer to the [Parameter Parser Type Definition Specification](params_type.md).

---

[日本語版](options.ja.md) | [English Version](options.md) 