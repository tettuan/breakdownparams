# User Variable Options Specification

## Overview
This document defines the specification for implementing user variable options as command-line options in the application. User variables use the prefix `uv` which stands for "user variable".

## Option Format
- User variables are defined in the `--uv-*` format
- The prefix `--uv-` is fixed for all user variables
- The `*` part represents the user variable name
- Multiple user variables can be specified simultaneously
- Internally normalized to `uv-*` format (leading hyphens removed)

## Option List

| Option Format | Description      | Value Type | Required | Example                    | Normalized Form |
|--------------|------------------|------------|----------|----------------------------|------------------|
| --uv-*       | User Variable    | string     | No       | `--uv-project=myproject`   | `uv-project`     |

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
- User variable names must satisfy the following:
  - Contain only alphanumeric characters
  - Allow minimal special characters (underscore, hyphen, etc.)
  - Case sensitive
  - Not empty
  - Validation is performed by the CustomVariableOption class

### Value Validation
- Values accept any valid terminal input
- No specific format restrictions
- Values must be specified after the `=` symbol
- Empty values are allowed

## Usage Examples

### One Variable
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
1. The OptionFactory creates CustomVariableOption instances for `--uv-*` arguments
2. Each user variable is normalized to `uv-*` format (e.g., `--uv-config` → `uv-config`)
3. The CustomVariableOption class handles its own normalization and validation
4. Error handling for invalid variable names is implemented in the Option class
5. Implementation follows the option-class-centered design pattern

## Error Cases

| Error Case           | Example Message                                    |
|----------------------|---------------------------------------------------|
| Invalid Variable Name Format | "Invalid user variable name format: {name}"       |
| Missing Value        | "Missing value for user variable: {name}"         |
| Duplicate Variable Name | "Duplicate user variable name: {name}"           |
| Invalid Syntax       | "Invalid user variable syntax: {option}"          |
| Invalid Parameter Type | "User variables are only available with TwoParams" |

## Type Definitions

### User Variables Type
```typescript
type UserVariables = {
  [key: `uv-${string}`]: string;  // Normalized form: uv-*
};
```

### Return Type Integration
```typescript
interface OptionParams {
  // ... existing properties ...
  [key: `uv-${string}`]: string;  // User variables are included directly with normalized keys
}
```

### Type Usage Examples
```typescript
// Example return value with user variables (normalized)
{
  from: "input.md",
  destination: "output.md",
  "uv-project": "myproject",      // Normalized from --uv-project
  "uv-version": "1.0.0",          // Normalized from --uv-version
  "uv-environment": "production"  // Normalized from --uv-environment
}

// When user variables are empty (no --uv-* options specified)
{
  from: "input.md",
  destination: "output.md"
  // No uv-* properties
}
```

### Type Constraints
- User variables are included directly in the return type with `uv-*` keys
- Keys are normalized to `uv-*` format (leading hyphens removed)
- Values are always strings, maintaining input as received from command line
- User variables only exist in TwoParams mode
- No properties are added when no user variables are provided

## Compatibility with Existing Specifications

### Parameter Type Compatibility
- User variables are only available in TwoParams mode
- Like the `--config` option, user variables are ignored in:
  - ZeroParams
  - OneParam
- Example: `breakdown to project --uv-environment=prod` (normalized to `uv-environment`)

### Case Sensitivity
- User variable names are case sensitive and must be used as specified
- Only hyphens are removed during normalization, case is preserved
- Variable name case is preserved and must match when accessing values
- Example: `--uv-Project` → `uv-Project`, `--uv-project` → `uv-project` (different variables)

### Option Priority
- User variables must follow the same priority rules as existing options
- When combined with other options, user variables must not interfere with their functionality
- All options are normalized consistently (e.g., `--help` → `help`, `--uv-env` → `uv-env`)
- Example: `breakdown to project --config test --uv-environment=prod`

### Error Handling
- Invalid user variables are handled by the CustomVariableOption class
- Invalid syntax (missing `=`) generates an error through the Option validation
- Validation errors are returned from the Option instance's validate() method

### Documentation Integration
- User variables must be documented in:
  - `docs/options.md`
  - `docs/glossary.md`
  - `docs/params.md`
- Usage examples must be added to existing documentation sections
- Normalization rules must be clearly explained

### Testing Requirements
- Unit tests must cover:
  - All parameter types (ZeroParams, OneParam, TwoParams)
  - Combinations with existing options
  - Normalization behavior (--uv-* → uv-*)
  - Error cases
  - Edge cases (empty values, special characters)
- Integration tests must verify:
  - End-to-end functionality
  - Documentation accuracy
  - Error message consistency

---

[日本語版](custom_variable_options.ja.md) | [English Version](custom_variable_options.md) 