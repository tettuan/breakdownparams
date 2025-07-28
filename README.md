# @tettuan/breakdownparams

A type-safe, option-class-centered command-line argument parser for task breakdown operations. This library provides comprehensive parsing, validation, and normalization of command-line arguments with a focus on security and extensibility.

For detailed information about parameter patterns and usage, please refer to the [Detailed Documentation](docs/index.md).

## Key Features

- **Type-safe parsing** with TypeScript discriminated unions
- **Option-class-centered design** for consistency and extensibility
- **Security-first validation** to prevent malicious inputs
- **Flexible parameter patterns** (0, 1, or 2 parameters)
- **User variable options** (`--uv-*`) for user-defined values
- **Comprehensive validation** at parameter, option, and combination levels
- **Unified normalization** for consistent option handling

## Installation

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@1.0.3';
```

## Usage

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@1.0.3';

const parser = new ParamsParser();

// Parse arguments
const result = parser.parse(Deno.args);

// Type-safe handling with discriminated unions
switch (result.type) {
  case 'zero':
    // No parameters, only options
    if (result.options.help) {
      console.log('Display help message');
    }
    if (result.options.version) {
      console.log('Display version');
    }
    break;

  case 'one':
    // Single parameter with directive type
    console.log(`Command: ${result.directiveType}`);
    if (result.directiveType === 'init') {
      console.log('Initialize project');
    }
    break;

  case 'two':
    // Two parameters with full semantic information
    console.log(`Directive Type: ${result.directiveType}`);
    console.log(`Layer Type: ${result.layerType}`);
    if (result.options.from) {
      console.log(`Input file: ${result.options.from}`);
    }
    break;

  case 'error':
    // Comprehensive error information
    console.error(`Error: ${result.error.message}`);
    console.error(`Code: ${result.error.code}`);
    console.error(`Category: ${result.error.category}`);
    break;
}
```

## Architecture Overview

The library follows an option-class-centered design where each option instance encapsulates its own behavior:

```
User Input → ParamsParser → Security Validation → Parameter/Option Separation
                ↓
        Option Factory → Option Classes (Flag/Value/UserVariable)
                ↓
        Parameter Validators → Option Validators → Combination Validators
                ↓
        Type-safe ParamsResult
```

## API Reference

### `ParamsParser`

The main parser class that orchestrates the entire parsing workflow.

```ts
const parser = new ParamsParser(optionRule?, customConfig?);
```

#### Constructor Parameters

- `optionRule?: OptionRule` - Defines allowed options for different parameter counts
- `customConfig?: CustomConfig` - Custom validation rules and behavior (includes two-parameter configuration)

#### Methods

- `parse(args: string[]): ParamsResult`
  - Processes command-line arguments with comprehensive validation
  - Returns a discriminated union result for type-safe handling
  - Performs security validation, parameter parsing, and option validation

### Result Types

The parser returns a discriminated union type `ParamsResult` with four possible outcomes:

#### `ZeroParamsResult`
- **When**: No positional parameters provided
- **Usage**: Commands that rely entirely on options
- **Example**: `command --help`, `command --version`

#### `OneParamsResult`
- **When**: Exactly one positional parameter
- **Properties**: `directiveType` - semantic category of the parameter
- **Example**: `command init`, `command status`

#### `TwoParamsResult`
- **When**: Exactly two positional parameters
- **Properties**: 
  - `directiveType` - first parameter's semantic category
  - `layerType` - second parameter's semantic category
- **Example**: `command to project`, `command from issue`

#### `ErrorResult`
- **When**: Parsing or validation fails
- **Properties**: Comprehensive `ErrorInfo` with message, code, and category
- **Categories**: `security`, `validation`, `invalid_format`

### Standard Options

#### Value Options
- `--from=<file>` or `-f=<file>`: Source file path
- `--destination=<file>` or `-o=<file>`: Output file path
- `--input=<type>` or `-i=<type>`: Input layer type
- `--adaptation=<mode>`: Adaptation strategy
- `--config=<name>` or `-c=<name>`: Configuration profile

#### Flag Options
- `--help` or `-h`: Display help information
- `--version` or `-v`: Display version information
- `--verbose`: Enable verbose output
- `--experimental`: Enable experimental features

### Option Normalization

All options are internally normalized to canonical names:
- Short forms (`-h`) → canonical name (`help`)
- Long forms (`--help`) → canonical name (`help`)
- User variables (`--uv-config`) → normalized name (`uv-config`)

For detailed option specifications, see the [Options Documentation](docs/options.md).

## Advanced Features

### User Variable Options

User-defined variables follow the `--uv-*` pattern for maximum flexibility:

```bash
# Define user variables for your workflow
breakdown to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production

# Access in your code
if (result.type === 'two') {
  const project = result.options['uv-project'];     // "myproject"
  const version = result.options['uv-version'];     // "1.0.0"
  const env = result.options['uv-environment'];     // "production"
}
```

**Features**:
- Unlimited user variables
- Automatic validation (syntax only)
- Normalized to `uv-<name>` format
- Available only in two-parameter mode

For specifications, see [User Variable Options](docs/user_variable_options.md).

### Validation System

The library implements a comprehensive three-tier validation system:

#### 1. Security Validation
- Prevents command injection and path traversal attacks
- Validates against malicious input patterns
- First line of defense in the parsing pipeline

#### 2. Parameter Validation
- **Zero parameters**: Ensures no positional arguments
- **One parameter**: Validates directive type format
- **Two parameters**: Validates both directive and layer types
- Configurable patterns via `CustomConfig`

#### 3. Option Validation
- **Existence validation**: Checks if options are allowed for parameter count
- **Value validation**: Ensures option values meet requirements
- **Combination validation**: Validates option combinations
- **User variable validation**: Syntax checking for `--uv-*` options

### Custom Configuration

Extend the parser's behavior with custom configuration:

```ts
import { ParamsParser, CustomConfig } from 'jsr:@tettuan/breakdownparams@1.0.3';

const customConfig: CustomConfig = {
  params: {
    two: {
      directiveType: {
        pattern: "^(to|from|via)$",
        errorMessage: "Invalid directive type. Must be one of: to, from, via"
      },
      layerType: {
        pattern: "^(project|issue|task|epic)$", 
        errorMessage: "Invalid layer type. Must be one of: project, issue, task, epic"
      }
    }
  },
  validation: {
    zero: {
      allowedOptions: ["help", "version"],
      allowedValueOptions: []
    },
    one: {
      allowedOptions: ["verbose"],
      allowedValueOptions: ["config"]
    },
    two: {
      allowedOptions: ["verbose", "experimental"],
      allowedValueOptions: ["from", "destination", "input", "config"]
    }
  }
};

const parser = new ParamsParser(undefined, customConfig);
```

## Examples

The `examples/` directory contains three CLI examples demonstrating different aspects of the parser:

1. `basic_usage.ts`: Basic command parsing and help display
   ```bash
   # Display help
   deno run examples/basic_usage.ts --help

   # Initialize project
   deno run examples/basic_usage.ts init

   # Convert task to issue
   deno run examples/basic_usage.ts to issue --from input.md
   ```

2. `error_handling.ts`: Error handling and validation demo
   ```bash
   # Display available error examples
   deno run examples/error_handling.ts --help

   # Try different error cases
   deno run examples/error_handling.ts unknown
   deno run examples/error_handling.ts to issue extra
   ```

3. `options_usage.ts`: Command-line options usage
   ```bash
   # Display options help
   deno run examples/options_usage.ts --help

   # Try different option formats
   deno run examples/options_usage.ts to issue --from input.md --destination output.md
   deno run examples/options_usage.ts to issue -f input.md -o output.md
   ```

Each example includes detailed help text and usage instructions. Run with `--help` to see available options.

## Type System

The library leverages TypeScript's type system for maximum safety:

```ts
import type { 
  ParamsResult, 
  ZeroParamsResult, 
  OneParamsResult, 
  TwoParamsResult,
  ErrorResult,
  ErrorInfo 
} from 'jsr:@tettuan/breakdownparams@1.0.3';

// The discriminated union ensures type safety
function handleResult(result: ParamsResult) {
  if (result.type === 'two') {
    // TypeScript knows these properties exist
    console.log(result.directiveType);
    console.log(result.layerType);
  }
  
  if (result.type === 'error') {
    // TypeScript knows error is defined here
    console.error(result.error.message);
  }
}
```

## Development

### Prerequisites

- Deno 2.x
- GitHub CLI (`gh`) for PR creation
- `jq` for JSON processing

### Testing

The project follows a comprehensive testing strategy:

```bash
# Run all tests
deno task test

# Run with coverage
deno task coverage

# Run CI pipeline (format, lint, test)
deno task ci
```

### Test Categories

1. **Architecture tests** (`0_architecture_*`): Design validation
2. **Structure tests** (`1_structure_*`): Component integration
3. **Unit tests** (`2_unit_*`): Individual functionality
4. **Implementation tests** (`tests/2_impliments/`): Core logic
5. **Combinatorial tests** (`tests/5_combinatorial/`): Edge cases
6. **E2E tests** (`tests/10_e2e/`): Full workflow validation

## Publishing

The package is published to JSR using GitHub Actions. To publish a new version:

1. Ensure all changes are committed and pushed
2. Run the publish script to prepare the release:

```bash
./scripts/publish.sh
```

This script will:
- Check for uncommitted changes
- Verify GitHub Actions tests have passed
- Regenerate `deno.lock`
- Run format, lint, and test checks
- Commit and push the updated lock file

## Version Management

To bump the version and create a new release:

```bash
./scripts/bump_version.sh
```

This script will:
- Check for uncommitted changes
- Verify GitHub Actions tests have passed
- Check latest version from JSR
- Remove newer tags than the latest JSR version
- Increment patch version
- Update `deno.json`
- Create and push a new git tag

When the tag is pushed, the new version will be automatically published to JSR.

## Contributing

Contributions are welcome! Please:

1. Follow the existing code style (enforced by `deno fmt`)
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure `deno task ci` passes

## License

MIT License - See LICENSE file for details.

## Related Documentation

- [Architecture Documentation](docs/architecture/)
- [API Reference](docs/types/)
- [Testing Guide](docs/testing.md)
- [Development Guide](docs/development.md)

---

[English Version](README.md) | [日本語版](README.ja.md)
