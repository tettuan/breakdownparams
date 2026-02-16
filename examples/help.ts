// deno-lint-ignore-file no-console
import { ParamsParser } from '../src/mod.ts';
import type { ZeroParamsResult } from '../src/mod.ts';

/**
 * Help example
 *
 * This example demonstrates the help functionality.
 * It should be the first example users run according to README.md
 */

// Test different help invocations
const testCases = [
  ['--help'],
  ['--version'],
  [], // No arguments
];

for (const args of testCases) {
  console.log(`\n=== Testing: ${args.length > 0 ? args.join(' ') : '(no arguments)'} ===`);

  const parser = new ParamsParser();
  const result = parser.parse(args);

  if (result.type === 'error') {
    console.error(`Error: ${result.error?.message}`);
    continue;
  }

  if (result.type === 'zero') {
    const zeroResult = result as ZeroParamsResult;
    const options = zeroResult.options as { help?: boolean; version?: boolean };

    if (options.help) {
      console.log(`
breakdownparams - Command line parameter parser

Usage: <command> [options]
       <command> <layer> [options]

Commands:
  init                Initialize a new project
  to <layer>         Convert to specified layer
  summary <layer>    Generate summary for layer
  defect <layer>     Report defects for layer

Layers:
  project            Project level
  issue              Issue level
  task               Task level

Options:
  -h, --help         Show this help message
  -v, --version      Show version number
  -f, --from=FILE    Source file path
  -o, --destination=FILE  Output file path
  -i, --input=TYPE   Input layer type
  -a, --adaptation=TYPE  Prompt adaptation type
  -c, --config=NAME  Configuration file name (TwoParams only)
  --uv-NAME=VALUE    User variable options (TwoParams only)

Examples:
  # Show help
  myapp --help
  
  # Initialize project
  myapp init
  
  # Convert between layers
  myapp to project --from=input.md --destination=output.md
  
  # Generate summary with options
  myapp summary task --config=prod --uv-env=production

Note: Short form options (-f, -o, etc.) are not currently implemented.
      User variables (--uv-*) are not currently implemented.
`);
    } else if (options.version) {
      console.log('breakdownparams v0.1.0');
    } else {
      console.log('No specific flags provided. Use --help for usage information.');
    }
  } else {
    console.log(`Unexpected result type: ${result.type}`);
  }
}
