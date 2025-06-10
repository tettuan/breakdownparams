# @tettuan/breakdownparams

Command-line argument parser for task breakdown. This module provides functionality to parse command-line arguments for task breakdown operations.

For detailed information about parameter patterns and usage, please refer to the [Detailed Documentation](docs/index.md).

## Installation

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@0.1.0';
```

## Usage

```ts
import { ParamsParser } from 'jsr:@tettuan/breakdownparams@0.1.0';

const parser = new ParamsParser();

// Parse arguments
const result = parser.parse(Deno.args);

// Handle different result types
switch (result.type) {
  case 'zero-params':
    if (result.help) {
      console.log('Display help message');
    }
    if (result.version) {
      console.log('Display version');
    }
    break;

  case 'one':
    if (result.command === 'init') {
      console.log('Initialize project');
    }
    break;

  case 'two':
    console.log(`Demonstrative Type: ${result.demonstrativeType}`);
    console.log(`Layer: ${result.layerType}`);
    if (result.options.fromFile) {
      console.log(`Input file: ${result.options.fromFile}`);
    }
    break;
}
```

## API

### `ParamsParser`

Main class for parsing command-line arguments.

#### Methods

- `parse(args: string[]): ParamsResult`
  Parses command-line arguments and returns a structured result.

### Result Types

Based on command-line arguments, the following result types are available. For details about available options for each type, please refer to the [Options Documentation](docs/options.md).

- `ZeroParamResult`: For commands without parameters or help/version flags
- `OneParamsResult`: For single commands like "init"
- `TwoParamsResult`: For commands with demonstrative type and layer type

### Options

- `--from` or `-f`: Specify source file
- `--destination` or `-o`: Specify output file
- `--input` or `-i`: Specify input layer type

For a complete list of options available for each result type, please refer to the [Options Documentation](docs/options.md).

## Advanced Features

### Custom Variable Options
You can define custom variables for task breakdown using the `--uv-*` format. These variables can be referenced in templates and will be replaced with values during processing.

Example:
```bash
breakdown to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production
```

### Extended Parameters
The parser supports extended parameter functionality for more complex task breakdown scenarios. This includes:
- Custom validation rules for parameter values
- Extended demonstrative types for task relationships
- Layer type extensions for custom task hierarchies
- Custom error messages for validation failures

Example:
```bash
breakdown to project --extended --custom-validation --error-format=detailed
```

### Configuration File Options
You can use configuration files to set default options and behaviors. Configuration files support:
- Default parameter values for common operations
- Custom validation rules for specific use cases
- Extended parameter settings for complex scenarios
- Environment-specific settings for different deployment stages

Configuration example:
```json
{
  "defaults": {
    "demonstrativeType": "to",
    "layerType": "project"
  },
  "validation": {
    "customRules": ["rule1", "rule2"]
  },
  "extended": {
    "enabled": true,
    "customTypes": ["type1", "type2"]
  }
}
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

## Development

### Prerequisites

- Deno
- GitHub CLI (`gh`)
- `jq` command-line tool

### Testing

```bash
deno task test
```

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

## License

MIT License - See LICENSE file for details.

---

[English Version](README.md) | [日本語版](README.ja.md)
