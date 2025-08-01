# Developer Documentation

## Overview

breakdownparams is a Deno library that parses command-line arguments and provides structured parameter data.
It specializes in parameter parsing, validation, and value storage, aiming for a simple and robust implementation.

## Design Principles

1. **Single Responsibility**
   - Only handles parameter parsing and storage
   - Does not interpret parameter meanings
   - Does not process values (e.g., path normalization)
   - Does not have default values (returns error on validation failure)

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
| --input      | -i         | Input layer specification  | `input`          |
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
   - Long forms (--from, --destination, --input) take precedence
   - Short forms (-f, -o, -i) are only valid when long form is not specified
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

## Constraints

1. **Unsupported Features**
   - Parameter meaning interpretation
   - Path validation/normalization
   - User variable option value validation (syntax check only)

2. **Limitations**
   - Maximum of 2 parameters
   - No path string processing
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