import { ParamsParser } from '../src/mod.ts';
import type { TwoParamsResult, ZeroParamsResult } from '../src/mod.ts';

// Example arguments for testing
const testArgs = [
  [
    'to',
    'issue',
    '--from=input.md',
    '--destination=output.md',
    '--input=project',
    '--adaptation=strict',
  ],
  ['to', 'issue', '-f=input.md', '-o=output.md', '-i=project', '-a=strict'],
  ['to', 'issue', '--from=input.md', '-o=output.md', '--input=project', '-a=strict'],
  ['summary', 'task', '--adaptation=strict'],
];

// Run tests for each argument set
for (const args of testArgs) {
  console.log(`\n=== Testing: ${args.join(' ')} ===`);

  const parser = new ParamsParser();
  const result = parser.parse(args);

  if (result.type === 'error') {
    console.error(`Error: ${result.error?.message}`);
    console.log('\nFor usage information, run: options_usage --help');
    continue;
  }

  if (result.type === 'zero') {
    const zeroResult = result as ZeroParamsResult;
    const options = zeroResult.options as { help?: boolean };

    if (options.help) {
      console.log(`
Usage: options_usage <command> <layer> [options]

Commands:
  to, summary, defect

Layers:
  project, issue, task

Options:
  --from=FILE, -f=FILE       Input file path
  --destination=FILE, -o=FILE Output file path
  --input=TYPE, -i=TYPE     Input layer type
  --adaptation=TYPE, -a=TYPE Prompt adaptation type

Examples:
  # Using long form options
  options_usage to issue --from=input.md --destination=output.md --input=project --adaptation=strict

  # Using short form options
  options_usage to issue -f=input.md -o=output.md -i=project -a=strict

  # Mixed options
  options_usage to issue --from=input.md -o=output.md --input=project -a=strict

  # Using adaptation option only
  options_usage summary task --adaptation=strict
`);
    }
  }

  // Process valid command
  if (result.type === 'two') {
    const twoResult = result as TwoParamsResult;
    const { directiveType, layerType, options = {} } = twoResult;

    console.log('Command processed successfully:');
    console.log('----------------------------');
    console.log(`Action: ${directiveType} ${layerType}`);

    const typedOptions = options as {
      from?: string;
      destination?: string;
      input?: string;
      adaptation?: string;
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
    if (typedOptions.adaptation) {
      console.log(`Prompt adaptation: ${typedOptions.adaptation}`);
    }
  }
}
