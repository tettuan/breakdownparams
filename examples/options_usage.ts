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
  --adaptation, -a <type>    Prompt adaptation type

Examples:
  # Using long form options
  options_usage to issue --from input.md --destination output.md --input project --adaptation strict

  # Using short form options
  options_usage to issue -f input.md -o output.md -i project -a strict

  # Mixed options
  options_usage to issue --from input.md -o output.md --input project -a strict

  # Using adaptation option only
  options_usage summary task --adaptation strict
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
  if (options?.adaptationType) {
    console.log(`Prompt adaptation: ${options.adaptationType}`);
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}
