# Custom Variable Options Specification

## Overview
This document defines the specification for implementing custom variable options as command-line options in the application.

## Option Format
- Custom variables are defined in the `--uv-*` format
- The prefix `--uv-` is fixed for all custom variables
- The `*` part represents the custom variable name
- Multiple custom variables can be specified simultaneously

## Option List

| Option Format | Description      | Value Type | Required | Example                    |
|--------------|------------------|------------|----------|----------------------------|
| --uv-*       | Custom Variable  | string     | No       | `--uv-project=myproject`   |

## Syntax
```
--uv-{variable_name}={value}
```

### Usage Examples
```bash
--uv-about=abc
--uv-something=weneed
--uv-project=myproject
--uv-version=1.0.0
```

## Rules and Constraints

### Variable Name Validation
- Custom variable names must satisfy the following:
  - Contain only alphanumeric characters
  - Allow minimal special characters (underscore, hyphen, etc.)
  - Case sensitive
  - Not empty

### Value Validation
- Values accept any valid terminal input
- No specific format restrictions
- Values must be specified after the `=` symbol
- Empty values are allowed

## Usage Examples

### Single Variable
```bash
breakdown to project --uv-project=myproject
```

### Multiple Variables
```bash
breakdown to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production
```

### Complex Values
```bash
breakdown to project --uv-path=/usr/local/bin --uv-config={"key":"value"} --uv-array=[1,2,3]
```

## Implementation Notes
1. The option parser must be able to handle multiple `--uv-*` options
2. Each custom variable must be stored as a name-value pair
3. The system must maintain variables in the specified order
4. Error handling for invalid variable names must be implemented
5. Implementation must be compatible with existing options

## Error Cases

| Error Case           | Example Message                                    |
|----------------------|---------------------------------------------------|
| Invalid Variable Name Format | "Invalid custom variable name format: {name}"     |
| Missing Value        | "Missing value for custom variable: {name}"       |
| Duplicate Variable Name | "Duplicate custom variable name: {name}"         |
| Invalid Syntax       | "Invalid custom variable syntax: {option}"        |
| Invalid Parameter Type | "Custom variables are only available with DoubleParams" |

## Type Definitions

### Custom Variables Type
```typescript
type CustomVariables = {
  [key: string]: string;
};
```

### Return Type Integration
```typescript
interface OptionParams {
  // ... existing properties ...
  customVariables?: CustomVariables;
}
```

### Type Usage Examples
```typescript
// Example return value with custom variables
{
  from: "input.md",
  destination: "output.md",
  customVariables: {
    "project": "myproject",
    "version": "1.0.0",
    "environment": "production"
  }
}

// When custom variables are empty (no --uv-* options specified)
{
  from: "input.md",
  destination: "output.md",
  customVariables: undefined
}
```

### Type Constraints
- `CustomVariables` is an optional property in the return type
- `CustomVariables` keys must match command-line variable names (including case)
- Values are always strings, maintaining input as received from command line
- This type only exists in DoubleParams mode
- Property becomes undefined when no custom variables are provided

## Compatibility with Existing Specifications

### Parameter Type Compatibility
- Custom variables are only available in DoubleParams mode
- Like the `--config` option, custom variables are ignored in:
  - NoParams
  - SingleParam
- Example: `breakdown to project --uv-environment=prod`

### Case Sensitivity
- Custom variable names are case sensitive and must be used as specified
- No case conversion or normalization is performed
- Variable name case is preserved and must match when accessing values
- Example: `--uv-Project` and `--uv-project` are treated as different variables

### Option Priority
- Custom variables must follow the same priority rules as existing options
- When combined with other options, custom variables must not interfere with their functionality
- Example: `breakdown to project --config test --uv-environment=prod`

### Error Handling
- Invalid custom variables are ignored without error (consistent with existing behavior)
- However, invalid syntax (missing `=`) must generate an error
- This balances flexibility with strict validation

### Documentation Integration
- Custom variables must be documented in:
  - `docs/options.md`
  - `docs/glossary.md`
  - `docs/params.md`
- Usage examples must be added to existing documentation sections

### Testing Requirements
- Unit tests must cover:
  - All parameter types (NoParams, SingleParam, DoubleParams)
  - Combinations with existing options
  - Error cases
  - Edge cases (empty values, special characters)
- Integration tests must verify:
  - End-to-end functionality
  - Documentation accuracy
  - Error message consistency

---

[日本語版](custom_variable_options.ja.md) | [English Version](custom_variable_options.md) 