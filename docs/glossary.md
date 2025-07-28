# Glossary

This document provides definitions for key terms used in the breakdownparams library.

## Purpose and Intent

This glossary is created for the following purposes:

1. **Term Standardization**
   - Clarify definitions of terms used within the library to maintain consistency
   - Facilitate communication between developers
   - Standardize term usage across all documentation

2. **Understanding Enhancement**
   - Make it easier to understand the background and intent of each term
   - Clarify relationships between terms
   - Help understand implementation intentions

3. **Easy Reference**
   - Provide direct links to related specifications
   - Facilitate access to detailed definitions and usage examples
   - Enable quick verification of implementation details

## Basic Terms

### Parameter Related

| Term          | Description                                                                                                                                    | Reference Specification    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| Positional Argument | Arguments specified without hyphens in the command line. Used to control the main functionality of the library, with meaning determined by position. | [params.md](params.md)     |
| Option        | Arguments specified with hyphens in the command line (e.g., `--help`). Used for detailed control and additional information. Supports both long and short forms. | [options.md](options.md)   |
| Alias         | Short form of options (e.g., `-h` for `--help`). Enables concise command writing and improves usability.                                         | [options.md](options.md)   |
| Long Form     | Complete form of options (e.g., `--help`). Used when readability and clarity are important. Recommended for documentation and scripts.           | [options.md](options.md)   |
| Short Form    | Abbreviated form of options (e.g., `-h`). Used for quick command line input. Recommended for interactive operations.                             | [options.md](options.md)   |

### Parameter Types

| Term          | Description                                                                                                                                    | Reference Specification    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| ZeroParams    | Parameter type with no positional arguments. Used for help and version commands.                                                                 | [params.md](params.md)     |
| OneParam   | Parameter type with one positional argument. Used to execute one operations like initialization. Currently only supports `init` command.     | [params.md](params.md)     |
| TwoParams     | Parameter type with two positional arguments. Used to execute main functionality. Specifies operation through combination of DirectiveType and LayerType. | [params.md](params.md)     |

### Main Types

| Term              | Description                                                                                                                                    | Reference Specification    |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| DirectiveType | Type of first positional argument. Default allows `to`, `summary`, `defect`. Validated with regex pattern.                                     | [params.md](params.md)     |
| LayerType         | Type of second positional argument. Default allows `project`, `issue`, `task`. Validated with regex pattern.                                   | [params.md](params.md)     |
| ParamsResult      | Basic type for parameter parsing results. Interface for handling parsing results with type safety. Includes error information.                  | [params_type.md](params_type.md) |
| OptionParams      | Type for option parameters. Interface for handling option values with type safety. Holds values for each option.                               | [params_type.md](params_type.md) |
| ErrorResult       | Type that holds error information. Includes error message and error code.                                                                      | [params_type.md](params_type.md) |

## Option Related

### Option Normalization

All options follow unified normalization rules where leading hyphens are removed from the canonical form:
- Long options: `--help` → `help`
- Short options: `-h` → `help` (resolved to primary name)
- User variables: `--uv-config` → `uv-config`

This normalization is handled by the Option classes themselves, following the option-class-centered design.

### Standard Options

| Option        | Alias | Description                                                                                                                                    | Reference Specification    |
|---------------|-------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| --help        | -h    | Display help information. Used to check library usage and available options.                                                                   | [options.md](options.md)   |
| --version     | -v    | Display version information. Used to check current library version.                                                                            | [options.md](options.md)   |
| --from        | -f    | Source file path. Specifies input file location. Supports both relative and absolute paths.                                                    | [options.md](options.md)   |
| --destination | -o    | Output file path. Specifies where to save results. Does not verify path existence.                                                             | [options.md](options.md)   |
| --input       | -i    | Input layer type. Specifies the source layer for processing. Only allows LayerType values.                                                     | [options.md](options.md)   |
| --adaptation  | -a    | Prompt adaptation type. Used to adjust processing behavior. Specifies customizable behavior.                                                   | [options.md](options.md)   |
| --config      | -c    | Configuration file name. Only available in TwoParams. Loads processing settings from external file.                                         | [options.md](options.md)   |

### User Variable Options

| Term                    | Description                                                                                                                                    | Reference Specification    |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| User Variable Option    | User-defined variables specified in `--uv-*` format where `uv` stands for "user variable". Only available in TwoParams mode. Normalized to `uv-*` format internally. | [user_variable_options.md](user_variable_options.md) |
| User Variable Name      | Variable name following the `--uv-` prefix. Only allows alphanumeric, underscore, and hyphen characters, case-sensitive.                       | [user_variable_options.md](user_variable_options.md) |
| UserVariables           | Type that holds user variable options. Consists of key-value pairs with keys in `uv-*` format, maintains values as received from command line. | [user_variable_options.md](user_variable_options.md) |

## Validation Related

| Term          | Description                                                                                                                                    | Reference Specification    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| Default Configuration | Validation configuration that supports standard usage patterns. Allows basic values for DirectiveType and LayerType.                    | [custom_params.md](custom_params.md) |
| Custom Configuration | User-defined validation configuration. Allows custom values with regex patterns.                                                              | [custom_params.md](custom_params.md) |
| ParserConfig  | Interface that defines parser configuration. Used to specify validation rules.                                                                  | [custom_params.md](custom_params.md) |

## Error Related

| Term              | Description                                                                                                                                    | Reference Specification    |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| Validation Error  | Error when parameter values don't meet constraints. Used to ensure type safety and prevent invalid usage.                                       | [custom_params.md](custom_params.md) |
| Configuration Error | Error when parser settings are invalid. Detects configuration mistakes, promotes proper usage.                                                 | [custom_params.md](custom_params.md) |

## Testing Related

| Term                | Description                                                                                                                                    | Reference Specification    |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| BreakdownLogger     | Logging utility for testing. Manages debug information collection, facilitates test tracking.                                                   | [testing.md](testing.md)   |
| Debug Log          | Log that records detailed debug information. Assists in problem identification and resolution, improves development process efficiency.        | [testing.md](testing.md)   |
| Pre-test Failure   | Failure occurring in pre-processing not intended for testing. Clarifies test intentions, promotes proper test design.                          | [testing.md](testing.md)   |

## Types

| Term | Description | Reference |
|------|------|------|
| ParamsResult | Unified type for parameter parsing results. Returns one of ZeroParamsResult, OneParamsResult, TwoParamsResult, or ErrorResult. | [params_type.md](params_type.md) |
| ZeroParamsResult | Result type for no parameters. Result when only options are specified. | [params_type.md](params_type.md) |
| OneParamsResult | Result type for single parameter. For init command. Options are ignored. | [params_type.md](params_type.md) |
| TwoParamsResult | Result type for two parameters. Contains DirectiveType and LayerType. Includes options and user variables. | [params_type.md](params_type.md) |

---

[日本語版](glossary.ja.md) | [English Version](glossary.md) 