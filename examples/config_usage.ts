import { ParamsParser } from '../src/mod.ts';
import type { OneParamsResult, TwoParamsResult, ZeroParamsResult } from '../src/mod.ts';

// Example arguments for testing
const testArgs = [
  ['to', 'project', '--config=test'],
  ['to', 'project', '-c=test'],
  ['to', 'project', '--from=input.md', '--destination=output.md', '--config=prod'],
  ['init', '--config=test'], // Config should be ignored for single param
  ['--help'],
];

// Run tests for each argument set
for (const args of testArgs) {
  console.log(`\n=== Testing: ${args.join(' ')} ===`);

  const parser = new ParamsParser();
  const result = parser.parse(args);

  if (result.type === 'error') {
    console.error(`Error: ${result.error?.message}`);
    console.log('\nFor usage information, run: config_usage --help');
    continue;
  }

  // Process valid command
  if (result.type === 'two') {
    const twoResult = result as TwoParamsResult;
    const { demonstrativeType, layerType, options = {} } = twoResult;

    console.log('Command processed successfully:');
    console.log('----------------------------');
    console.log(`Action: ${demonstrativeType} ${layerType}`);

    const typedOptions = options as {
      from?: string;
      destination?: string;
      input?: string;
      config?: string;
    };

    if (typedOptions.from) {
      console.log(`Input file: ${typedOptions.from}`);
    }
    if (typedOptions.destination) {
      console.log(`Output file: ${typedOptions.destination}`);
    }
    if (typedOptions.input) {
      console.log(`Converting from layer: ${typedOptions.input}`);
    }
    if (typedOptions.config) {
      console.log(`Using config: ${typedOptions.config}`);
    }
  } else if (result.type === 'one') {
    const oneResult = result as OneParamsResult;
    console.log('Single param mode');
    console.log(`Command: ${oneResult.demonstrativeType}`);

    const typedOptions = oneResult.options as { config?: string };
    if (typedOptions.config) {
      console.log('Note: Config option is ignored in single param mode');
    }
    
    // Handle the error case
    if (oneResult.error) {
      console.log(`Note: ${oneResult.error.message}`);
      console.log('Config option is only available with TwoParams');
    }
  } else if (result.type === 'zero') {
    const zeroResult = result as ZeroParamsResult;
    const typedOptions = zeroResult.options as { help?: boolean; version?: boolean };

    console.log('No params mode');
    if (typedOptions.help) {
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
  --config=NAME, -c=NAME    Configuration file name (TwoParams only)

Examples:
  # Using config option
  config_usage to project --config=test
  config_usage to project -c=test

  # With other options
  config_usage to project --from=input.md --destination=output.md --config=prod

  # Single param mode (config ignored)
  config_usage init --config=test

  # No params mode
  config_usage --help
`);
    }
    if (typedOptions.version) {
      console.log('Version requested');
    }
  }
}
