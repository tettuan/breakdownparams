import { ParamsParser } from '../src/mod.ts';
import { ParamPatternResult } from '../src/core/params/types.ts';

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

if (!result.success) {
  console.error(`Error: ${result.error?.message}`);
  console.log('\nFor usage information, run: options_usage --help');
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
  if (options?.adaptationType) {
    console.log(`Prompt adaptation: ${options.adaptationType}`);
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}
