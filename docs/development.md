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
   - Returns error result without the parameter on validation failure

## Implementation Specifications

### 1. Type Definitions

Parameter types are classified into three categories based on the number of positional arguments:

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

For detailed type definitions and usage of each type, please refer to the [Parameter Parser Type Definition Specification](params_type.md).

### 2. Option Definitions

Options are specified as hyphenated arguments. Each option supports both long and short forms:

| Long Form      | Short Form | Description                |
| -------------- | ---------- | -------------------------- |
| --help         | -h         | Show help                  |
| --version      | -v         | Show version              |
| --from         | -f         | Input file specification  |
| --destination  | -o         | Output file specification |
| --input        | -i         | Input layer specification |
| --adaptation   | -a         | Prompt adaptation type    |
| --config       | -c         | Configuration file name   |
| --uv-*         | None       | Custom variable options   |

### 3. Validation Rules

1. **Argument Count**
   - 0: Only options allowed
   - 1: Only `init` command allowed
   - 2: demonstrativeType and layerType combination
   - 3 or more: Error

2. **Value Constraints**
   - Aliases are only valid in lowercase
   - Undefined aliases are ignored
   - Long form takes precedence (when conflicting with short form)
   - Last specification is valid when options are duplicated

3. **Option Priority**
   - Long form (--from, --destination, --input) takes precedence
   - Short form (-f, -o, -i) is only valid when long form is not specified
   - When the same option is specified multiple times, the last specification is valid

4. **Case Sensitivity**
   - Layer type aliases are only valid in lowercase
   - Aliases containing uppercase are treated as invalid
   - Custom variable option names are case-sensitive and used as specified

5. **Custom Variable Option Constraints**
   - Only available in TwoParams mode
   - Syntax must strictly follow `--uv-<name>=<value>` format
   - Variable names only allow alphanumeric and minimal special characters
   - Values are treated as strings, no validation performed

### 4. Error Definitions

Errors return appropriate messages based on the type of problem that occurred:

| Error Case                | Example Message                                          |
| ------------------------- | -------------------------------------------------------- |
| Too many arguments        | "Too many arguments. Maximum 2 arguments are allowed."   |
| Invalid value             | "Invalid demonstrative type. Must be one of: to, summary, defect" |
| Missing required parameter| "Missing required parameter: {param}"                    |
| Custom variable syntax error | "Invalid custom variable option syntax: {value}"     |

## Usage Examples

### Basic Usage Examples

```typescript
import { ParamsParser } from './mod.ts';

// Initialize parser with default settings
const parser = new ParamsParser();

// No parameters
parser.parse([]);
// { type: "zero-params", help: false, version: false }

// Show help
parser.parse(['-h']);
// { type: "zero-params", help: true, version: false }

// Initialize
parser.parse(['init']);
// { type: "one", command: "init" }

// Two parameters
parser.parse(['to', 'issue', '--from=./input.md']);
// {
//   type: "two",
//   demonstrativeType: "to",
//   layerType: "issue",
//   options: { fromFile: "./input.md" }
// }

// Combined options
parser.parse(['summary', 'task', '--from=./tasks.md', '-a', 'strict']);
// {
//   type: "two",
//   demonstrativeType: "summary",
//   layerType: "task",
//   options: { fromFile: "./tasks.md", adaptation: "strict" }
// }
```

### Usage Examples with Custom Settings

```typescript
// Initialize parser with custom settings
const customConfig = {
  demonstrativeType: {
    pattern: '^[a-z]+$',  // Only lowercase letters allowed
    errorMessage: 'Invalid demonstrative type'
  },
  layerType: {
    pattern: '^[a-z]+$',  // Only lowercase letters allowed
    errorMessage: 'Invalid layer type'
  }
};

const customParser = new ParamsParser(customConfig);

// Two parameters with custom settings
customParser.parse(['custom', 'layer', '--from=./input.md']);
// {
//   type: "two",
//   demonstrativeType: "custom",
//   layerType: "layer",
//   options: { fromFile: "./input.md" }
// }
```

### Two Parameters with Custom Variable Options

```typescript
// Two parameters with custom variable options
parser.parse(['to', 'project', '--uv-project=myproject', '--uv-version=1.0.0']);
// {
//   type: "two",
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
   - Path validation and normalization
   - Case normalization (except for layer type aliases)
   - Custom variable option value validation (syntax check only)

2. **Limitations**
   - Maximum of 2 parameters
   - Aliases are lowercase only
   - No path string processing
   - Last specification is valid when options are duplicated
   - Custom variable options only available in TwoParams mode

## Testing Strategy

1. **Unit Tests**
   - Parameter parsing
   - Option parsing
   - Validation
   - Error handling

2. **Integration Tests**
   - Complete command-line argument parsing
   - Error case handling
   - Alias handling

3. **Edge Cases**
   - Empty arguments
   - Invalid formats
   - Undefined options
   - Mixed case sensitivity

---

[日本語版](development.ja.md) | [English Version](development.md) 