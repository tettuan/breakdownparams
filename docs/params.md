# Parameters Specification

This document defines the specification for parameters (positional arguments) in the breakdownparams library.

## Option Normalization Rules

The library applies consistent normalization rules for all options:
- Leading hyphens are removed from the canonical form
- Aliases are resolved to their primary names
- Examples:
  - `--help` → `help`
  - `-h` → `help` 
  - `--uv-config` → `uv-config`

## Parameter Types

Parameters are classified into three types based on the number of positional arguments:

1. **ZeroParams**
   - No positional arguments
   - Only options can be specified
   - Example: `breakdown --help`

2. **OneParam**
   - One positional argument
   - Valid value: `init`
   - Example: `breakdown init`

3. **TwoParams**
   - Two positional arguments
   - Format: `<demonstrativeType> <layerType>`
   - Example: `breakdown to project`

## DemonstrativeType

Values that can be specified as the first parameter:

| Value   | Description      |
| ------- | ---------------- |
| to      | Convert to target |
| summary | Generate summary  |
| defect  | Report defect     |

## LayerType

Values that can be specified as the second parameter:

| Value   | Description |
| ------- | ----------- |
| project | Project     |
| issue   | Issue       |
| task    | Task        |

## Parameter Constraints

1. **Number of Arguments**
   - 0: Only options allowed
   - 1: Only `init` command allowed
   - 2: Combination of demonstrativeType and layerType
   - 3 or more: Error

## Usage Examples

### ZeroParams

```bash
breakdown
```

### OneParam

```bash
breakdown init
```

### TwoParams

```bash
breakdown to project
breakdown summary issue
breakdown defect task
breakdown to project --config test
breakdown summary task -c test
```

## Error Cases

| Error Case           | Example Message                                    |
| -------------------- | -------------------------------------------------- |
| Too many arguments   | "Too many arguments. Maximum 2 arguments are allowed." |
| Invalid DemonstrativeType | "Invalid value for demonstrativeType: {value}"     |
| Invalid LayerType    | "Invalid value for layerType: {value}"             |
| Invalid Config usage | "Config option is only available with TwoParams" |

## Return Type

The parameter parsing result is returned with the following type:

```typescript
type ParamsResult = ZeroParamsResult | OneParamsResult | TwoParamsResult;
```

For detailed type definitions and usage, please refer to the [Parameter Parser Type Definition Specification](params_type.md).

---

[日本語版](params.ja.md) | [English Version](params.md) 