import { ParamsParser } from '../src/mod.ts';
import { ParamPatternResult } from '../src/core/params/types.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: error_handling [command] [options]

This example demonstrates error handling in the CLI parser.
Try these invalid commands to see error handling in action:

1. Invalid command:
   error_handling unknown

2. Too many arguments:
   error_handling to issue extra

3. Invalid demonstrative type:
   error_handling invalid issue

4. Invalid layer type:
   error_handling to invalid

5. Invalid option format:
   error_handling to project --from src
   error_handling to project --unknown-option

6. Help and usage:
   error_handling --help
`);
}

if (!result.success) {
  console.error(`Error: ${result.error?.message}`);
  console.log('\nFor usage information, run: error_handling --help');
  Deno.exit(1);
}

const data = result.data as ParamPatternResult;

if (data.type === 'zero' && data.help) {
  showUsage();
  Deno.exit(0);
}

// If we get here, the command was valid
console.log('Command processed successfully:');
console.log(JSON.stringify(data, null, 2));
