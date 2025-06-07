# Validation Specifications

This document defines the validation functionality specifications for the breakdownparams library.

## 1. Validator Structure

```yaml
# Parser and Validator Dependencies

ParamsParser:
  - BaseValidator:
      - Base validator class
      - Error code and category management
  - SecurityErrorValidator:
      - Command injection detection
      - Security checks
  - OptionsValidator:
      - Unified option format validation
      - Provides common option validation logic for all parsers
      - Option normalization and standardization
      - Option value type checking
      - Required option validation
      - Option dependency checking
  - DemonstrativeTypeValidator:
      - Demonstrative type validation
      - Value validation using regex patterns
      - Default pattern: ^(to|summary|defect)$
  - LayerTypeValidator:
      - Layer type validation
      - Value validation using regex patterns
      - Default pattern: ^(project|issue|task)$
  - ZeroParamValidator:
      - Validates argument patterns without commands
      - Handles --help, --version flags
  - OneParamValidator:
      - Single parameter validation
      - Handles init command
  - TwoParamValidator:
      - Two parameter validation
      - Demonstrative type and layer type validation
      - Custom variable option validation

# Validation Configuration

ParserConfig:
  demonstrativeType:
    pattern: string  # Regex pattern
    errorMessage?: string  # Custom error message
  layerType:
    pattern: string  # Regex pattern
    errorMessage?: string  # Custom error message

# Default Configuration Values

DEFAULT_CONFIG:
  demonstrativeType:
    pattern: "^(to|summary|defect)$"
    errorMessage: "Invalid demonstrative type. Must be one of: to, summary, defect"
  layerType:
    pattern: "^(project|issue|task)$"
    errorMessage: "Invalid layer type. Must be one of: project, issue, task"

# Option Format Definitions

format:
  # Basic format
  long: "--key=value"     # Long form format
  short: "-k=value"       # Short form format
  
  # Pattern definitions
  pattern:
    key: "[a-zA-Z0-9-]+"  # Key name character restrictions (alphanumeric and hyphen only)
    value: ".+"           # Value restrictions (non-empty string)
  
  # Special cases
  special_cases:
    - "-c=value" -> "configFile"
    - "--config=value" -> "configFile"
    - "--help" -> "help"
    - "--version" -> "version"
  
  # Custom variables
  custom_variables:
    prefix: "--uv-"       # Custom variable prefix
    pattern: "--uv-[a-zA-Z0-9-]+=.+"  # Complete custom variable pattern

# Validation Rules

validation:
  # Value validation
  empty_value: "error"    # Empty value handling (error: error, warn: warning, allow: allow)
  unknown_option: "error" # Unknown option handling
  duplicate: "error"      # Duplicate handling
  
  # Required options
  required_options: []    # List of required options
  
  # Value type checking
  value_types: ["string"] # Allowed value types

# Error Definitions

errors:
  validation:
    - code: "INVALID_DEMONSTRATIVE_TYPE"
      message: "Invalid demonstrative type. Must be one of: to, summary, defect"
    - code: "INVALID_LAYER_TYPE"
      message: "Invalid layer type. Must be one of: project, issue, task"
    - code: "INVALID_OPTION_FORMAT"
      message: "Invalid option format. Must be in the form: --key=value"
    - code: "INVALID_CUSTOM_VARIABLE"
      message: "Invalid custom variable option syntax: {value}"
  configuration:
    - code: "INVALID_PATTERN"
      message: "Invalid regex pattern: {pattern}"
    - code: "MISSING_PATTERN"
      message: "Pattern is required for {type}"
    - code: "INVALID_CONFIG"
      message: "Invalid configuration: {reason}"
```

---

[日本語版](validation.ja.md) | [English Version](validation.md) 