import { ParamsParser } from '../mod.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: options_usage <command> <layer> [options]

Commands:
  to, summary, defect

Layers:
  project, issue, task (and their aliases)

Options:
  --from, -f <file>          Input file path
  --destination, -o <file>    Output file path
  --input, -i <layer>        Input layer type

Examples:
  # Using long form options
  options_usage to issue --from input.md --destination output.md --input project

  # Using short form options
  options_usage to issue -f input.md -o output.md -i project

  # Mixed options
  options_usage to issue --from input.md -o output.md --input project

  # Using aliases
  options_usage summary pj -f project.md
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
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}

// Process valid command
if (result.type === 'double') {
  const { demonstrativeType, layerType, options = {} } = result;

  console.log('Command processed successfully:');
  console.log('----------------------------');
  console.log(`Action: ${demonstrativeType} ${layerType}`);

  if (options?.fromFile) {
    console.log(`Input file: ${options.fromFile}`);
  }
  if (options?.destinationFile) {
    console.log(`Output file: ${options.destinationFile}`);
  }
  if (options?.fromLayerType) {
    console.log(`Converting from layer: ${options.fromLayerType}`);
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}
