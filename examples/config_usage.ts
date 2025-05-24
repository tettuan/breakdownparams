import { ParamsParser } from '../mod.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: config_usage <command> <layer> [options]

Commands:
  to, summary, defect

Layers:
  project, issue, task (and their aliases)

Options:
  --config, -c <name>        Configuration file name (without extension)
  --from, -f <file>          Input file path
  --destination, -o <file>    Output file path
  --input, -i <layer>        Input layer type

Examples:
  # Using config option with long form
  config_usage to project --config test

  # Using config option with short form
  config_usage to project -c test

  # Using config with other options
  config_usage to project --config test --from input.md --destination output.md

  # Config option is ignored in single param mode
  config_usage init --config test

  # Config option is ignored in no params mode
  config_usage --config test
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
  console.log('\nFor usage information, run: config_usage --help');
  Deno.exit(1);
}

// Process valid command
if (result.type === 'double') {
  const { demonstrativeType, layerType, options = {} } = result;

  console.log('Command processed successfully:');
  console.log('----------------------------');
  console.log(`Action: ${demonstrativeType} ${layerType}`);

  if (options?.configFile) {
    console.log(`Configuration: ${options.configFile}`);
  }
  if (options?.fromFile) {
    console.log(`Input file: ${options.fromFile}`);
  }
  if (options?.destinationFile) {
    console.log(`Output file: ${options.destinationFile}`);
  }
  if (options?.fromLayerType) {
    console.log(`Converting from layer: ${options.fromLayerType}`);
  }
} else if (result.type === 'single') {
  console.log('Config option is ignored in single param mode');
  console.log(`Command: ${result.command}`);
} else if (result.type === 'no-params') {
  console.log('Config option is ignored in no params mode');
  if (result.help) {
    console.log('Help requested');
  }
  if (result.version) {
    console.log('Version requested');
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: config_usage --help');
  Deno.exit(1);
} 