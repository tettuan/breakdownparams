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

## Implementation Specification

### 1. Type Definitions

Parameter types are classified into three types based on the number of positional arguments:

1. **NoParams**
   - No positional arguments
   - Only options can be specified
   - Example: `breakdown --help`

2. **SingleParam**
   - One positional argument
   - Valid value: `init`
   - Example: `breakdown init`

3. **DoubleParams**
   - Two positional arguments
   - Format: `<demonstrativeType> <layerType>`
   - Example: `breakdown to project`

For detailed type definitions and usage of each type, please refer to the [Parameter Parser Type Definition Specification](params_type.md).

### 2. Option Definitions

Options are specified as hyphenated arguments. Each option supports both long and short forms:

| Long Form     | Short Form | Description                |
|--------------|------------|----------------------------|
| --help       | -h         | Display help              |
| --version    | -v         | Display version           |
| --from       | -f         | Input file specification  |
| --destination| -o         | Output file specification |
| --input      | -i         | Input layer specification |
| --adaptation | -a         | Prompt adaptation type    |
| --config     | -c         | Configuration file name   |
| --uv-*       | None       | Custom variable option    |

### 3. Validation Rules

1. **Argument Count**
   - 0: Only options allowed
   - 1: Only `init` command allowed
   - 2: Combination of demonstrativeType and layerType
   - 3 or more: Error

2. **Value Constraints**
   - Only lowercase aliases are valid
   - Undefined aliases are ignored
   - Long form takes precedence (when conflicting with short form)
   - Last specification takes effect for duplicate options

3. **Option Priority**
   - Long forms (--from, --destination, --input) take precedence
   - Short forms (-f, -o, -i) are only valid when long form is not specified
   - Last specification takes effect when same option is specified multiple times

4. **Case Sensitivity**
   - Only lowercase aliases are valid for layer types
   - Aliases containing uppercase letters are treated as invalid
   - Custom variable option names are case sensitive and used as specified

5. **Custom Variable Option Constraints**
   - Only available in DoubleParams mode
   - Syntax must strictly follow `--uv-<name>=<value>` format
   - Variable names only allow alphanumeric and minimal special characters
   - Values are treated as strings without validation

### 4. Error Definitions

Errors return appropriate messages based on the type of problem encountered:

| Error Case    | Example Message                                    |
|--------------|---------------------------------------------------|
| Too Many Args | "Too many arguments. Maximum 2 arguments are allowed." |
| Invalid Value | "Invalid value for demonstrativeType: {value}"    |
| Missing Param | "Missing required parameter: {param}"             |
| Custom Var Syntax Error | "Invalid custom variable option syntax: {value}" |

## Usage Examples

### Basic Usage Examples

```typescript
import { ParamsParser } from './mod.ts';

const parser = new ParamsParser();

// No parameters
parser.parse([]);
// { type: "no-params", help: false, version: false }

// Help display
parser.parse(['-h']);
// { type: "no-params", help: true, version: false }

// Initialization
parser.parse(['init']);
// { type: "single", command: "init" }

// Two parameters
parser.parse(['to', 'issue', '--from', './input.md']);
// {
//   type: "double",
//   demonstrativeType: "to",
//   layerType: "issue",
//   options: { fromFile: "./input.md" }
// }

// Combined options
parser.parse(['summary', 'task', '--from', './tasks.md', '-a', 'strict']);
// {
//   type: "double",
//   demonstrativeType: "summary",
//   layerType: "task",
//   options: { fromFile: "./tasks.md", adaptation: "strict" }
// }
```

### Two Parameters with Custom Variable Options

```typescript
// Two parameters with custom variable options
parser.parse(['to', 'project', '--uv-project=myproject', '--uv-version=1.0.0']);
// {
//   type: "double",
//   demonstrativeType: "to",
//   layerType: "project",
//   options: {
//     customVariables: {
//       "project": "myproject",
//       "version": "1.0.0"
//     }
//   }
// }
```

## Constraints

1. **Unsupported Features**
   - Parameter meaning interpretation
   - Path validation/normalization
   - Case normalization (except for layer type aliases)
   - Custom variable option value validation (syntax check only)

2. **Limitations**
   - Maximum of 2 parameters
   - Lowercase aliases only
   - No path string processing
   - Last specification takes effect for duplicate options
   - Custom variable options only available in DoubleParams mode

## Testing Strategy

1. **Unit Tests**
   - Parameter parsing
   - Option parsing
   - Validation
   - Error handling

2. **Integration Tests**
   - Complete command-line argument parsing
   - Error case handling
   - Alias processing

3. **Edge Cases**
   - Empty arguments
   - Invalid formats
   - Undefined options
   - Mixed case 

---

[日本語版](development.ja.md) | [English Version](development.md) 