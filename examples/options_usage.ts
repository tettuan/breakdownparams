import { ParamsParser } from '../src/mod.ts';
import type { TwoParamResult } from '../src/mod.ts';

// Example arguments to demonstrate options usage
const exampleArgs = [
  'to',
  'project',
  '--from=input.md',
  '--destination=output.md',
  '--input=issue',
  '--adaptation=strict',
];

console.log('Executing command with arguments:', exampleArgs.join(' '));

const parser = new ParamsParser();
const result = parser.parse(exampleArgs);

// Helper function to display usage
function showUsage() {
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

if (result.type === 'error') {
  console.error(`Error: ${result.error?.message}`);
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}

if (result.type === 'zero' && result.options.help) {
  showUsage();
  Deno.exit(0);
}

// Process valid command
if (result.type === 'two') {
  const { demonstrativeType, layerType, options = {} } = result as TwoParamResult;

  console.log('Command processed successfully:');
  console.log('----------------------------');
  console.log(`Action: ${demonstrativeType} ${layerType}`);

  if (options?.from) {
    console.log(`Input file: ${options.from}`);
  }
  if (options?.destination) {
    console.log(`Output file: ${options.destination}`);
  }
  if (options?.input) {
    console.log(`Converting from layer: ${options.input}`);
  }
  if (options?.adaptation) {
    console.log(`Prompt adaptation: ${options.adaptation}`);
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}
