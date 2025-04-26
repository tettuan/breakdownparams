# Options by Result Type

This document provides a comprehensive overview of available options for each Result Type in the breakdownparams library.

## NoParamsResult

Options available when no positional parameters are provided.

| Option | Alias | Description | Value Type | Required |
|--------|-------|-------------|------------|----------|
| --help | -h | Display help information | boolean | No |
| --version | -v | Display version information | boolean | No |

## SingleParamResult

Options available when a single command (e.g., "init") is provided.

No additional options are available for single parameter commands. The only valid single parameter is:
- `init`

## DoubleParamsResult

Options available when both DemonstrativeType and LayerType are provided (e.g., "to issue").

| Option | Alias | Description | Value Type | Required | Example |
|--------|-------|-------------|------------|----------|---------|
| --from | -f | Source file path | string | No | `--from input.md` |
| --destination | -o | Output file path | string | No | `--destination output.md` |
| --input | -i | Input layer type | enum | No | `--input project` |
| --adaptation | -a | Prompt adaptation type | string | No | `--adaptation strict` |

### Input Layer Type Values

When using the `--input` option, the following values are supported and normalized:

| Input Value(s) | Normalized To |
|----------------|---------------|
| project, pj, prj | project |
| issue, story | issue |
| task, todo, chore, style, fix, error, bug | task |

### Adaptation Option Value Rules

The value for `--adaptation`/`-a` must follow these rules:

- Only the following characters are allowed:
  - Alphanumeric characters (`a-z`, `A-Z`, `0-9`)
  - Underscores (`_`)
  - Hyphens (`-`)
- The value must not be empty.
- Any other character (including spaces, slashes `/`, dots `.`, symbols, or non-ASCII characters) is not allowed.

#### Examples

| Value         | Accepted? | Reason                        |
| ------------- | --------- | ----------------------------- |
| `strict`      | Yes       | Alphanumeric                  |
| `my_adapt`    | Yes       | Underscore allowed            |
| `my-adapt`    | Yes       | Hyphen allowed                |
| `a08`         | Yes       | Alphanumeric                  |
| `a08&^`       | No        | Special chars not allowed     |
| `my/adapt`    | No        | Slash not allowed             |
| `my.adapt`    | No        | Dot not allowed               |
| `ストリクト`   | No        | Japanese not allowed          |
| `adapt😀`      | No        | Emoji not allowed             |
| (empty)       | No        | Must not be empty             |

#### Pattern (Regex)

```
^[a-zA-Z0-9_-]+$
```

#### Error Handling

If an invalid value is provided, the parser will return an error indicating the invalid adaptation value and the allowed pattern.

## Option Precedence Rules

1. Long form vs Short form:
   - When both forms are provided (e.g., `--from` and `-f`), the long form takes precedence

2. Case Sensitivity:
   - All options and aliases must be lowercase
   - Uppercase variants are ignored without error

3. Invalid Options:
   - Undefined options are ignored without error
   - No validation is performed on file paths

## Usage Examples

### NoParamsResult
```bash
breakdown --help
breakdown -v
```

### SingleParamResult
```bash
breakdown init
```

### DoubleParamsResult
```bash
breakdown to issue --from input.md --destination output.md
breakdown to issue -f input.md -o output.md -i project
breakdown summary task --from unorganized_tasks.md -o task_markdown_dir -a strict
breakdown summary task -f unorganized_tasks.md -o task_markdown_dir -a a
``` 