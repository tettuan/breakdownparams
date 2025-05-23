import { ParamsParser } from '../mod.ts';

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

5. Help and usage:
   error_handling --help
`);
}

// Display help if requested
if (result.type === 'no-params' && result.help) {
  showUsage();
  Deno.exit(0);
}

// Handle any errors
if ('error' in result && result.error) {
  console.error(`Error: ${result.error}`);
  console.log('\nFor usage information, run: error_handling --help');
  Deno.exit(1);
}

// If we get here, the command was valid
console.log('Command processed successfully:');
console.log(JSON.stringify(result, null, 2));
