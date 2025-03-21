# @tettuan/breakdownparams

A command line argument parser for breakdown tasks. This module provides functionality to parse command line arguments for task breakdown operations.

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

- `NoParamsResult`: For commands with no parameters or help/version flags
- `SingleParamResult`: For single commands like "init"
- `DoubleParamsResult`: For commands with demonstrative and layer type

### Options

- `--from` or `-f`: Specify source file
- `--destination` or `-o`: Specify destination file
- `--input` or `-i`: Specify input layer type

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
