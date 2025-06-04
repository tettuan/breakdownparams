import { ParamsParser } from '../src/mod.ts';
import { ParamsResult, ZeroParamsResult, OneParamResult, TwoParamResult } from '../src/result/types.ts';

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
  --from=FILE, -f=FILE       Input file path
  --destination=FILE, -o=FILE Output file path
  --input=TYPE, -i=TYPE     Input layer type
  --config=NAME, -c=NAME    Configuration file name

Examples:
  # Using standard options
  config_usage to project --from=input.md --destination=output.md

  # Using short form options
  config_usage to project -f=input.md -o=output.md

  # Mixed options
  config_usage to project --from=input.md -o=output.md

  # Using config option
  config_usage to project --config=test
  config_usage to project -c=test

  # Single param mode
  config_usage init

  # No params mode
  config_usage --help
`);
}

if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  console.log('\nFor usage information, run: config_usage --help');
  Deno.exit(1);
}

if (result.type === 'zero') {
  const zeroResult = result as ZeroParamsResult;
  if (zeroResult.options['help'] === 'true') {
    showUsage();
    Deno.exit(0);
  }
}

// Process valid command
if (result.type === 'two') {
  const twoResult = result as TwoParamResult;

  console.log('Command processed successfully:');
  console.log('----------------------------');
  console.log(`Action: ${twoResult.demonstrativeType} ${twoResult.layerType}`);

  if (twoResult.options['from']) {
    console.log(`Input file: ${twoResult.options['from']}`);
  }
  if (twoResult.options['destination']) {
    console.log(`Output file: ${twoResult.options['destination']}`);
  }
  if (twoResult.options['input']) {
    console.log(`Converting from layer: ${twoResult.options['input']}`);
  }
  if (twoResult.options['config']) {
    console.log(`Using config: ${twoResult.options['config']}`);
  }
} else if (result.type === 'one') {
  const oneResult = result as OneParamResult;
  console.log('Single param mode');
  console.log(`Command: ${oneResult.demonstrativeType}`);
} else if (result.type === 'zero') {
  console.log('No params mode');
  if (result.options['help'] === 'true') {
    console.log('Help requested');
  }
  if (result.options['version'] === 'true') {
    console.log('Version requested');
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: config_usage --help');
  Deno.exit(1);
}
