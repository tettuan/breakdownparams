import { ParamsParser } from '../src/mod.ts';
import { ParamsResult, ZeroParamsResult, OneParamResult, TwoParamResult } from '../src/result/types.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

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

if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  console.log('\nFor usage information, run: options_usage --help');
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
  if (twoResult.options['adaptation']) {
    console.log(`Prompt adaptation: ${twoResult.options['adaptation']}`);
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}
