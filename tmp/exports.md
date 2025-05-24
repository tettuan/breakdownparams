# Exported Elements

## Classes

### `ParamsParser`
A class to parse and validate command line arguments for the breakdown structure system.

**Source**: `src/params_parser.ts`

**Description**:
This class provides functionality to parse command line arguments with type safety and validation,
supporting various command patterns and options for managing breakdown structures.

## Types

### `ParamsType`
**Source**: `src/types.ts`

Type representing the different kinds of parameter combinations that can be parsed.
This type is used to categorize the command line arguments into distinct patterns.

### `ErrorCategory`
**Source**: `src/types.ts`

Categories of errors that can occur during parameter parsing.
These categories help in organizing and handling different types of errors.

### `ErrorCode`
**Source**: `src/types.ts`

Error codes for parameter parsing.
These codes provide specific identification for different error scenarios.

### `DemonstrativeType`
**Source**: `src/types.ts`

Type representing the available demonstrative types that indicate the action to perform.
These types define the main operations that can be performed on breakdown structures.

### `LayerType`
**Source**: `src/types.ts`

Type representing the available layer types in the breakdown structure.
These types define the different levels of granularity in the breakdown structure.

### `FromLayerTypeAlias`
**Source**: `src/types.ts`

Type representing all possible layer type aliases.
This type is derived from the keys of LayerTypeAliasMap and includes all valid alias strings
that can be used to specify a layer type.

## Interfaces

### `ErrorInfo`
**Source**: `src/types.ts`

Interface representing detailed error information.
This interface provides comprehensive error details for debugging and error handling.

### `NoParamsResult`
**Source**: `src/types.ts`

Result type for when no parameters are provided.
This type is used when the command is run without any arguments,
potentially including help or version flags.

### `SingleParamResult`
**Source**: `src/types.ts`

Result type for when a single parameter is provided.
This type is used for commands like 'init' that take a single argument.

### `DoubleParamsResult`
**Source**: `src/types.ts`

Result type for when two parameters are provided.
This type is used for commands that require both a demonstrative type and a layer type.

### `OptionParams`
**Source**: `src/types.ts`

Interface representing optional parameters that can be provided with commands.
These options can be specified using either long form (--option) or short form (-o).

### `ParserConfig`
**Source**: `src/types.ts`

Interface representing the configuration for the ParamsParser.
This interface defines the configuration options that can be used to customize
the behavior of the parameter parser.

## Constants

### `LayerTypeAliasMap`
**Source**: `src/types.ts`

Mapping of layer type aliases to their canonical layer types.
This constant maps various shorthand and alternative names to their standardized layer types.
For example, 'pj' and 'prj' both map to 'project'. 