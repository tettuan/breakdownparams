# Examples

This directory contains example scripts demonstrating how to use the breakdownparams package.

## Files

### basic_usage.ts
Basic command-line argument parsing example showing:
- Command handling (`init`, `to`, `summary`, `defect`)
- Layer type handling (`project`, `issue`, `task`)
- Help and version flags

```bash
# Show help
deno run basic_usage.ts --help

# Show version
deno run basic_usage.ts --version

# Initialize a new project
deno run basic_usage.ts init

# Convert to a specific layer
deno run basic_usage.ts to issue

# Generate summary for a layer
deno run basic_usage.ts summary project
```

### error_handling.ts
Demonstrates error handling and validation:
- Invalid command detection
- Argument count validation
- Invalid type checking
- Help message display

```bash
# Show usage information
deno run error_handling.ts --help

# Test invalid command
deno run error_handling.ts unknown

# Test too many arguments
deno run error_handling.ts to issue extra

# Test invalid demonstrative type
deno run error_handling.ts invalid issue

# Test invalid layer type
deno run error_handling.ts to invalid
```

### options_usage.ts
Shows how to use command-line options:
- Long and short form options
- File input/output options
- Layer type conversion options

```bash
# Using long form options
deno run options_usage.ts to issue --from input.md --destination output.md --input project

# Using short form options
deno run options_usage.ts to issue -f input.md -o output.md -i project

# Mixed options
deno run options_usage.ts to issue --from input.md -o output.md --input project

# Using layer aliases
deno run options_usage.ts summary pj -f project.md
```

## Running Examples

All examples require the following permissions:
- `--allow-env`: For accessing environment variables
- `--allow-write`: For file writing operations
- `--allow-read`: For file reading operations

Run examples with:

```bash
deno run --allow-env --allow-write --allow-read examples/<example_file>.ts [arguments]
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