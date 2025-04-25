# Examples

This directory contains example scripts demonstrating how to use the breakdownparams library.

## Basic Usage (`basic_usage.ts`)

Basic command-line argument parsing example showing:

- Command handling (`init`, `to`, `summary`, `defect`)
- Layer type handling (`project`, `issue`, `task`)
- Help and version flags

```bash
# Show help
deno run basic_usage.ts --help

# Show version
deno run basic_usage.ts --version

# Initialize project
deno run basic_usage.ts init

# Convert to issue layer
deno run basic_usage.ts to issue
```

## Error Handling (`error_handling.ts`)

Demonstrates error handling and validation:

- Invalid command detection
- Too many arguments
- Invalid demonstrative type
- Invalid layer type

```bash
# Show help
deno run error_handling.ts --help

# Try invalid commands
deno run error_handling.ts unknown
deno run error_handling.ts to issue extra
deno run error_handling.ts invalid issue
deno run error_handling.ts to invalid
```

## Options Usage (`options_usage.ts`)

Shows how to use command-line options:

- Long and short form options
- File input/output options
- Layer type conversion

```bash
# Using long form options
deno run options_usage.ts to issue --from input.md --destination output.md --input project

# Using short form options
deno run options_usage.ts to issue -f input.md -o output.md -i project

# Mixed options
deno run options_usage.ts to issue --from input.md -o output.md --input project
```

## Required Permissions

The examples require the following permissions:

- `--allow-env`: For accessing environment variables

## Running Examples

To run any example, use the following command pattern:

```bash
deno run --allow-env <example_file.ts> [arguments...]
```

## Testing Examples

To test the examples, use:

```bash
deno test --allow-env --allow-write --allow-read examples/<example_file>.ts
```

For debugging, you can use the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read examples/<example_file>.ts
```