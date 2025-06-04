import { ParamsParser } from '../src/mod.ts';
import { ParamPatternResult } from '../src/core/params/types.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: config_usage <command> <layer> [options]

Commands:
  to, summary, defect

Layers:
  project, issue, task

Options:
  --from FILE, -f FILE       Input file path
  --destination FILE, -o FILE Output file path
  --input TYPE, -i TYPE     Input layer type
  --config NAME, -c NAME    Configuration file name

Examples:
  # Using standard options
  config_usage to project --from input.md --destination output.md

  # Using short form options
  config_usage to project -f input.md -o output.md

  # Mixed options
  config_usage to project --from input.md -o output.md

  # Using config option
  config_usage to project --config test
  config_usage to project -c test

  # Single param mode
  config_usage init

  # No params mode
  config_usage --help
`);
}

if (!result.success) {
  console.error(`Error: ${result.error?.message}`);
  console.log('\nFor usage information, run: config_usage --help');
  Deno.exit(1);
}

const data = result.data as ParamPatternResult;

if (data.type === 'zero' && data.help) {
  showUsage();
  Deno.exit(0);
}

// Process valid command
if (data.type === 'two') {
  const { demonstrativeType, layerType, options = {} } = data;

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
  if (options?.configFile) {
    console.log(`Using config: ${options.configFile}`);
  }
} else if (data.type === 'one') {
  console.log('Single param mode');
  console.log(`Command: ${data.command}`);
} else if (data.type === 'zero') {
  console.log('No params mode');
  if (data.help) {
    console.log('Help requested');
  }
  if (data.version) {
    console.log('Version requested');
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: config_usage --help');
  Deno.exit(1);
}
