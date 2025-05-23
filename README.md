# @tettuan/breakdownparams

A command line argument parser for breakdown tasks. This module provides functionality to parse command line arguments for task breakdown operations.

For detailed documentation about parameter patterns and usage, please see the [detailed documentation](docs/index.md).

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
  case 'no-params':
    if (result.help) {
      console.log('Show help message');
    }
    if (result.version) {
      console.log('Show version');
    }
    break;

  case 'single':
    if (result.command === 'init') {
      console.log('Initialize project');
    }
    break;

  case 'double':
    console.log(`Demonstrative: ${result.demonstrativeType}`);
    console.log(`Layer: ${result.layerType}`);
    if (result.options.fromFile) {
      console.log(`From file: ${result.options.fromFile}`);
    }
    break;
}
```

## API

### `ParamsParser`

The main class for parsing command line arguments.

#### Methods

- `parse(args: string[]): ParamsResult`
  Parses command line arguments and returns a structured result.

### Result Types

The following result types are available based on the command line arguments provided. For a detailed breakdown of available options for each type, see [Options Documentation](docs/options.md).

- `NoParamsResult`: For commands with no parameters or help/version flags
- `SingleParamResult`: For single commands like "init"
- `DoubleParamsResult`: For commands with demonstrative and layer type

### Options

- `--from` or `-f`: Specify source file
- `--destination` or `-o`: Specify destination file
- `--input` or `-i`: Specify input layer type

For a comprehensive list of options available for each result type, see the [Options Documentation](docs/options.md).

## Advanced Features

### Custom Variable Options
Custom variables can be defined and used in your breakdown tasks using the `--uv-*` format. These variables can be referenced in your templates and will be replaced with their values during processing.

Example:
```bash
breakdown to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production
```

### Extended Parameters
The parser supports extended parameter functionality that allows for more complex task breakdown scenarios. This includes:
- Custom validation rules for parameter values
- Extended demonstrative types for task relationships
- Layer type extensions for custom task hierarchies
- Custom error messages for validation failures

Example:
```bash
breakdown to project --extended --custom-validation --error-format=detailed
```

### Configuration File Options
You can use a configuration file to set default options and behaviors. The configuration file supports:
- Default parameter values for common operations
- Custom validation rules for your specific use cases
- Extended parameter settings for complex scenarios
- Environment-specific configurations for different deployment stages

Example configuration:
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

The `examples/` directory contains three CLI examples that demonstrate different aspects of the parser:

1. `basic_usage.ts`: Basic command parsing and help display
   ```bash
   # Show help
   deno run examples/basic_usage.ts --help

   # Initialize project
   deno run examples/basic_usage.ts init

   # Convert task to issue
   deno run examples/basic_usage.ts to issue --from input.md
   ```

2. `error_handling.ts`: Demonstrates error handling and validation
   ```bash
   # Show available error examples
   deno run examples/error_handling.ts --help

   # Try different error cases
   deno run examples/error_handling.ts unknown
   deno run examples/error_handling.ts to issue extra
   ```

3. `options_usage.ts`: Shows how to work with command line options
   ```bash
   # Show options help
   deno run examples/options_usage.ts --help

   # Try different option formats
   deno run examples/options_usage.ts to issue --from input.md --destination output.md
   deno run examples/options_usage.ts to issue -f input.md -o output.md
   ```

Each example includes detailed help text and usage instructions. Run them with `--help` to see available options.

## Development

### Prerequisites

- Deno
- GitHub CLI (`gh`)
- `jq` command line tool

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
- Check the latest version from JSR
- Remove any tags newer than the latest JSR version
- Increment the patch version
- Update `deno.json`
- Create and push a new git tag

The new version will be automatically published to JSR when the tag is pushed.

## License

MIT License - see LICENSE file for details.
