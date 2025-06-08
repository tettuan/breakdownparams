import { ParamsParser } from '../src/mod.ts';
import type { ZeroParamsResult, OneParamResult, TwoParamResult } from '../src/mod.ts';

// Example arguments for testing
const testArgs = [
  ['to', 'project'],
  ['to', 'project', '--from=input.md', '--destination=output.md'],
  ['invalid', 'project'],  // Invalid demonstrative type
  ['to', 'invalid'],       // Invalid layer type
];

// Run tests for each argument set
for (const args of testArgs) {
  console.log(`\n=== Testing: ${args.join(' ')} ===`);
  
  const parser = new ParamsParser();
  const result = parser.parse(args);

  // Handle different result types
  if (result.type === 'error') {
    console.error('Error:', result.error?.message);
    console.log('\nFor usage information, run: extended_params_usage --help');
    continue;
  }

  if (result.type === 'zero') {
    const zeroResult = result as ZeroParamsResult;
    const options = zeroResult.options as { help?: boolean; version?: boolean };
    
    if (options.help) {
      console.log(`
Usage: extended_params_usage <command> <layer> [options]

This example demonstrates extended mode with custom validation.

Commands:
  to, summary, defect (standard demonstrative types)

Layers:
  project, issue, task (standard layer types)

Options:
  --from=FILE, -f=FILE       Input file path
  --destination=FILE, -o=FILE Output file path
  --input=TYPE, -i=TYPE     Input layer type

Examples:
  # Using standard demonstrative type
  extended_params_usage to project

  # Using standard layer type
  extended_params_usage to project

  # With options
  extended_params_usage to project --from=input.md --destination=output.md

  # Invalid demonstrative type
  extended_params_usage invalid project

  # Invalid layer type
  extended_params_usage to invalid
`);
    } else {
      console.log('No parameters provided');
      if (options.version) {
        console.log('Version requested');
      }
    }
  }

  if (result.type === 'two') {
    const twoResult = result as TwoParamResult;
    console.log('Command processed successfully:');
    console.log('----------------------------');
    console.log('Demonstrative Type:', twoResult.demonstrativeType);
    console.log('Layer Type:', twoResult.layerType);
    if (twoResult.options) {
      console.log('Options:', twoResult.options);
    }
  } else if (result.type === 'one') {
    const oneResult = result as OneParamResult;
    console.log('Command:', oneResult.demonstrativeType);
    if (oneResult.options) {
      console.log('Options:', oneResult.options);
    }
  }
}
