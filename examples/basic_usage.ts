import { ParamsParser } from '../src/mod.ts';
import type { ZeroParamsResult, OneParamResult, TwoParamResult } from '../src/mod.ts';

// Example arguments for testing
const testArgs = [
  ['--help'],                           // Show help
  ['--version'],                        // Show version
  ['init'],                             // Initialize command
  ['to', 'project'],                    // Two params example
  ['to', 'issue', '--from=input.md', '--destination=output.md'],
  ['summary', 'task', '--config=test'],
];

// Run tests for each argument set
for (const args of testArgs) {
  console.log(`\n=== Testing: ${args.join(' ')} ===`);
  
  const parser = new ParamsParser();
  const result = parser.parse(args);

  if (result.type === 'error') {
    console.error(`Error: ${result.error?.message}`);
    continue;
  }

  switch (result.type) {
    case 'zero': {
      const zeroResult = result as ZeroParamsResult;
      const options = zeroResult.options as { help?: boolean; version?: boolean };
      
      if (options.help) {
        console.log(`
Usage: basic_usage [command] [options]

Commands:
  init                Initialize a new project
  to <layer>         Convert to specified layer
  summary <layer>    Generate summary for layer
  defect <layer>     Report defects for layer

Layers:
  project            Project level
  issue             Issue level
  task              Task level

Options:
  -h, --help        Show this help message
  -v, --version     Show version number
  -f, --from=FILE   Source file path
  -o, --destination=FILE Output file path
  -i, --input=TYPE  Input layer type
  -c, --config=NAME Configuration file name
`);
      } else if (options.version) {
        console.log('v0.1.0');
      } else {
        console.log('No specific action for zero params');
      }
      break;
    }

    case 'one': {
      const oneResult = result as OneParamResult;
      if (oneResult.demonstrativeType === 'init') {
        console.log('Initializing new project...');
        // Add initialization logic here
      }
      break;
    }

    case 'two': {
      const twoResult = result as TwoParamResult;
      const { demonstrativeType, layerType, options = {} } = twoResult;
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
      break;
    }
  }
}
