import { ParamsParser } from '../src/mod.ts';
import type { ParamsResult } from '../src/mod.ts';

// Example arguments for testing error cases
const testArgs = [
  ['unknown'], // Invalid command
  ['to', 'issue', 'extra'], // Too many arguments
  ['invalid', 'issue'], // Invalid directive type
  ['to', 'invalid'], // Invalid layer type
  ['to', 'project', '--unknown=value'], // Unknown option
  ['--help'], // Help
];

// Run tests for each argument set
for (const args of testArgs) {
  console.log(`\n=== Testing: ${args.join(' ')} ===`);

  const parser = new ParamsParser();
  const result = parser.parse(args) as ParamsResult;

  if (result.error) {
    console.error(`Error: ${result.error?.message}`);
    console.error(`Error Code: ${result.error?.code}`);
    console.error(`Error Category: ${result.error?.category}`);
  } else if (result.type === 'zero' && (result.options as { help?: boolean }).help) {
    console.log(`
Usage: error_handling [command] [options]

This example demonstrates error handling in the CLI parser.
Try these invalid commands to see error handling in action:

1. Invalid command:
   error_handling unknown

2. Too many arguments:
   error_handling to issue extra

3. Invalid directive type:
   error_handling invalid issue

4. Invalid layer type:
   error_handling to invalid

5. Invalid option format:
   error_handling to project --from src
   error_handling to project --unknown-option

6. Help and usage:
   error_handling --help
`);
  } else {
    // If we get here, the command was valid
    console.log('Command processed successfully:');
    console.log('Type:', result.type);

    if (result.type === 'one' && 'directiveType' in result) {
      console.log('Command:', result.directiveType);
    } else if (result.type === 'two' && 'directiveType' in result && 'layerType' in result) {
      console.log('Directive Type:', result.directiveType);
      console.log('Layer Type:', result.layerType);
    }

    console.log('Options:', result.options || {});
  }
}
