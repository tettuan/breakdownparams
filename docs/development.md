# Developer Documentation

## Overview

breakdownparams is a Deno library that parses command-line arguments and provides structured parameter data.
It specializes in parameter parsing, validation, and value storage, aiming for a simple and robust implementation.

## Design Principles

1. **Single Responsibility**
   - Only handles parameter parsing and storage
   - Does not interpret parameter meanings
   - Does not process path values (no normalization, no resolution, no filesystem access)
   - Does not have default values (returns error on validation failure)
   - Performs only the minimum security checks described in "Security Validation" below

2. **Clear Interface**
   - Input: String array (command-line arguments)
   - Output: Typed parameter object
   - Error: Clear error messages
   - Returns error result without the failed parameter on validation failure

3. **Option-Class-Centered Design**
   - Each option instance holds its own normalization logic
   - Option classes manage their own validation
   - Unified normalization rules across the system
   - OptionFactory creates appropriate Option instances from CLI arguments

## Implementation Specification

### 1. Type Definitions

Parameter types are classified into three types based on the number of positional arguments:

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
   - Format: `<directiveType> <layerType>`
   - Example: `breakdown to project`

For detailed type definitions and usage of each type, please refer to the [Parameter Parser Type Definition Specification](params_type.md).

### 2. Option Definitions

Options are specified as hyphenated arguments. Each option supports both long and short forms:

| Long Form     | Short Form | Description                | Normalized Form |
|--------------|------------|----------------------------|------------------|
| --help       | -h         | Display help               | `help`           |
| --version    | -v         | Display version            | `version`        |
| --from       | -f         | Input file specification   | `from`           |
| --destination| -o         | Output file specification  | `destination`    |
| --edition    | -e         | Edition layer specification| `edition`        |
| --adaptation | -a         | Prompt adaptation type     | `adaptation`     |
| --config     | -c         | Configuration file name    | `config`         |
| --uv-*       | None       | User variable option       | `uv-*`           |

### Option Normalization

All options follow unified normalization rules:
- Leading hyphens are removed from the canonical form
- Aliases are resolved to their primary names
- Examples:
  - `--help` → `help`
  - `-h` → `help`
  - `--uv-config` → `uv-config`

### 3. Validation Rules

1. **Argument Count**
   - 0: Only options allowed
   - 1: Only `init` command allowed
   - 2: Combination of directiveType and layerType
   - 3 or more: Error

2. **Value Constraints**
   - Long form takes precedence (when conflicting with short form)
   - Last specification takes effect for duplicate options

3. **Option Priority**
   - Long forms (--from, --destination, --edition) take precedence
   - Short forms (-f, -o, -e) are only valid when long form is not specified
   - Last specification takes effect when same option is specified multiple times

4. **Case Sensitivity**
   - User variable option names are case sensitive and used as specified

5. **User Variable Option Constraints**
   - Only available in TwoParams mode
   - Syntax must strictly follow `--uv-<name>=<value>` format
   - Variable names only allow alphanumeric and minimal special characters
   - Values are treated as strings without validation
   - Internally normalized to `uv-*` format (leading hyphens removed)

### 4. Error Definitions

Errors return appropriate messages based on the type of problem encountered:

| Error Case    | Example Message                                    |
|--------------|---------------------------------------------------|
| Too Many Args | "Too many arguments. Maximum 2 arguments are allowed." |
| Invalid Value | "Invalid value for directiveType: {value}"    |
| Missing Param | "Missing required parameter: {param}"             |
| User Var Syntax Error | "Invalid user variable option syntax: {value}" |

## Usage Examples

### Basic Usage Examples

```typescript
import { ParamsParser } from './mod.ts';

const parser = new ParamsParser();

// No parameters
parser.parse([]);
// { type: "zero-params", help: false, version: false }

// Help display
parser.parse(['-h']);
// { type: "zero-params", help: true, version: false }

// Initialization
parser.parse(['init']);
// { type: "one", command: "init" }

// Two parameters
parser.parse(['to', 'issue', '--from', './input.md']);
// {
//   type: "two",
//   directiveType: "to",
//   layerType: "issue",
//   options: { fromFile: "./input.md" }
// }

// Combined options
parser.parse(['summary', 'task', '--from', './tasks.md', '-a', 'strict']);
// {
//   type: "two",
//   directiveType: "summary",
//   layerType: "task",
//   options: { fromFile: "./tasks.md", adaptation: "strict" }
// }
```

### Two Parameters with User Variable Options

```typescript
// Two parameters with user variable options (normalized)
parser.parse(['to', 'project', '--uv-project=myproject', '--uv-version=1.0.0']);
// {
//   type: "two",
//   directiveType: "to",
//   layerType: "project",
//   options: {
//     "uv-project": "myproject",  // Normalized from --uv-project
//     "uv-version": "1.0.0"       // Normalized from --uv-version
//   }
// }
```

## Security Validation

The parser ships a declarative, two-phase security validator. Callers express intent through `CustomConfig.security.policy`; the validator turns that policy into per-category regex enforcement. The default policy is `'safe'` for every category — the parser performs real enforcement out of the box and rejects classic injection / traversal patterns. Even with `'safe'` the parser does **not** normalize, resolve, or stat any value; only the regex checks below run.

### Five categories

| Category          | What it rejects                                                                 | Scope                                              |
|-------------------|---------------------------------------------------------------------------------|----------------------------------------------------|
| `shellInjection`  | Shell control metacharacters (`;`, `|`, `&`, `<`, `>`, optionally backtick / `$` / newlines / `$( )`) | **Global.** Every raw argument (Phase 1).          |
| `absolutePath`    | POSIX absolute paths (`/x`); `strict` also rejects Windows drive / UNC paths   | Phase 2, only options whose `kind` is `'path'`.    |
| `homeExpansion`   | `~/x` (and `~` alone with `strict`)                                             | Phase 2, only options whose `kind` is `'path'`.    |
| `parentTraversal` | `..` traversal (`../`, `..\\`, trailing `..`); `strict` also matches URL-encoded `%2e%2e` | Phase 2, only options whose `kind` is `'path'`.    |
| `specialChars`    | Control characters `\x00`–`\x1F` and `\x7F`; `strict` extends to `\x7F`–`\x9F` | Phase 2, only options whose `kind` is `'path'`.    |

`shellInjection` is intentionally global because Phase 1 runs before option resolution and cannot see option identity. The other four are *path-kind only*: built-in `--from` and `--destination` default to `kind: 'path'`; every other built-in value option (`--input`, `--adaptation`, `--config`, `--edition`) defaults to `kind: 'text'`. Caller-defined value options default to `kind: 'text'` as well.

### Three levels per category

Each category understands three levels:

| Level    | Behaviour                                                                                         |
|----------|---------------------------------------------------------------------------------------------------|
| `'off'`  | Disabled. The category performs no check.                                                         |
| `'safe'` | Default. Rejects high-confidence patterns with low false-positive rate.                           |
| `'strict'` | Broader pattern set; covers encoded variants and additional metacharacters.                     |

### Behaviour matrix

The exact regex enforced at each level:

| Category × Level | `off` | `safe` | `strict` |
|---|---|---|---|
| `shellInjection`  | (no check) | `/[;\|&<>]/` | `/[;\|&<>` `` ` `` `$\n\r]\|\$\(/` |
| `absolutePath`    | (no check) | `/^\/(?!\/)/` | `/^(\/\|[A-Za-z]:[\/\\]\|\\\\[^\\]+\\)/` |
| `homeExpansion`   | (no check) | `/^~(?:\/\|$)/` | `/^~/` |
| `parentTraversal` | (no check) | `/\.\.[\/\\]\|\.\.$/` | `/\.\.[\/\\]\|\.\.$\|%2[Ee]%2[Ee]\|%2[Ee]\.\|\.%2[Ee]/` |
| `specialChars`    | (no check) | `/[\x00-\x1F\x7F]/` | `/[\x00-\x1F\x7F-\x9F]/` |

Concrete examples for every safe-level check:

- `shellInjection safe`: `--from=foo;rm` is rejected; `foo$bar` passes (only `strict` rejects `$`).
- `absolutePath safe`: `--from=/etc/passwd` is rejected; `--from=//double` passes safe (the negative lookahead allows it; `strict` rejects it via the leading-slash branch).
- `homeExpansion safe`: `--from=~/data` and `--from=~` are rejected; `--from=~README` passes safe but is rejected by `strict`.
- `parentTraversal safe`: `--from=../sibling`, `--from=foo/..` are rejected; `--from=..README` passes (no `/` or `\` after `..`).
- `specialChars safe`: `--from=name\x00` is rejected; high-bit bytes `\x80`–`\x9F` only trigger at `strict`.

### Two-phase architecture

Validation is split across `ParamsParser.parse(...)`:

1. **Phase 1 (`SecurityValidator.validatePhase1(args)`)** runs immediately on the raw argument array, before any option resolution. It enforces `shellInjection` only — all other categories are out of scope here because option identity is unknown.
2. **Phase 2 (`SecurityValidator.validatePhase2(input)`)** runs after the option factory has resolved each argument into a canonical option name plus value. For each resolved option it looks up the option's `kind` and `securityPolicy`, calls `resolveEffectivePolicy(...)`, and tests the value against the four path-related categories using **first-hit-wins** ordering: `shellInjection` → `absolutePath` → `homeExpansion` → `parentTraversal` → `specialChars`.

User variable options (`--uv-*`) and bare positional arguments have no `kind` association and are therefore never subjected to the four path categories. They still pass through Phase 1's `shellInjection` check.

### Default behaviour

When `CustomConfig.security` is omitted, the runtime treats it as `{ policy: 'safe' }` for every category. The legacy `validate(args)` entry point (used by standalone unit tests) additionally enforces a backward-compatible `parentTraversal safe` check on every non-`--uv-*` argument so v1.2.x callers that bypass `ParamsParser` retain the previous traversal behaviour.

### Per-option override semantics

Each value `OptionDefinition` may carry its own `securityPolicy`. The resolver merges the policies for a given value as follows:

1. Expand the global `CustomConfig.security.policy` into a full per-category map (missing keys fall back to `'safe'`).
2. If the per-option policy is a single `Level` string, use that level uniformly for every category.
3. If it is a partial map, override only the keys the caller specifies.
4. If the option's `kind` is not `'path'`, force `absolutePath`, `homeExpansion`, `parentTraversal`, and `specialChars` to `'off'` regardless of the merged value.

**Constraint: per-option `securityPolicy` cannot relax `shellInjection`.** Phase 1 happens before option identity is known, so any per-option override of `shellInjection` is silently ineffective at Phase 1 (and Phase 2 itself never runs `shellInjection` against path values — `shellInjection` is path-kind-irrelevant). Concretely: setting `securityPolicy: { shellInjection: 'off' }` on an option does not allow `;` to appear in that option's value if the global policy is `'safe'`.

### What the parser still does **not** do

- No path normalization or resolution (`path.normalize`, `path.resolve` are never called)
- No filesystem access (existence, permission, or stat checks)
- No directory traversal of the filesystem
- No allow-list / deny-list judgment of paths
- No interpretation of value semantics beyond the regex enforcement above

### Error message format

A rejection produces an `ErrorResult` whose `error.code` is `SECURITY_ERROR`, `error.category` is `security`, and `error.message` follows the canonical shape:

```
Security error: <category> violation in <context>
```

`<context>` is `option <name>` (for `--name=...` / `-x=...`), `argument` (for `--uv-*`), or `positional` (for bare positional arguments).

## Constraints

1. **Unsupported Features**
   - Parameter meaning interpretation
   - Path normalization/resolution (only the minimal traversal check above is performed)
   - Filesystem access of any kind
   - User variable option value validation (syntax check only)

2. **Limitations**
   - Maximum of 2 parameters
   - No path string processing beyond the minimal security check
   - Last specification takes effect for duplicate options
   - User variable options only available in TwoParams mode

## Architecture Overview

### Key Components

1. **OptionFactory**
   - Creates Option instances from command-line arguments
   - Determines option type (ValueOption, FlagOption, UserVariableOption)
   - Manages standard option definitions and aliases

2. **Option Classes**
   - `ValueOption`: Options that accept values
   - `FlagOption`: Boolean options without values
   - `UserVariableOption`: User-defined variables with `--uv-*` prefix
   - Each class implements the Option interface with normalization and validation

3. **ParamsParser**
   - Uses OptionFactory to create Option instances
   - Extracts normalized values from Option instances
   - Delegates validation to Option instances
   - Returns structured parameter results

4. **Validators**
   - Work with normalized Option instances
   - No longer handle normalization (delegated to Option classes)
   - Focus purely on validation logic

## Testing Strategy

1. **Unit Tests**
   - Parameter parsing
   - Option parsing
   - Validation
   - Error handling

2. **Integration Tests**
   - Complete command-line argument parsing
   - Error case handling

3. **Edge Cases**
   - Empty arguments
   - Invalid formats
   - Undefined options
   - Mixed case 

---

[日本語版](development.ja.md) | [English Version](development.md) 