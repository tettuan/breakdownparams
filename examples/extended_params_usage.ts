import { ParamsParser } from '../src/mod.ts';
import { ParamPatternResult } from '../src/core/params/types.ts';

// Create parser instance
const parser = new ParamsParser();
const result = parser.parse(Deno.args);

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: extended_params_usage <command> <layer> [options]

This example demonstrates extended mode with custom validation.

Commands:
  to, summary, defect (standard demonstrative types)

Layers:
  project, issue, task (standard layer types)

Options:
  --from=FILE, -f=FILE       Input file path
  --destination=FILE, -o=FILE Output file path
  --input=TYPE, -i=TYPE     Input layer type

Examples:
  # Using standard demonstrative type
  extended_params_usage to project

  # Using standard layer type
  extended_params_usage to project

  # With options
  extended_params_usage to project --from=input.md --destination=output.md

  # Invalid demonstrative type
  extended_params_usage invalid project

  # Invalid layer type
  extended_params_usage to invalid
`);
}

// Handle different result types
if (!result.success) {
  console.error('Error:', result.error?.message);
  console.log('\nFor usage information, run: extended_params_usage --help');
  Deno.exit(1);
}

const data = result.data as ParamPatternResult;

if (data.type === 'zero' && data.help) {
  showUsage();
  Deno.exit(0);
}

if (data.type === 'two') {
  console.log('Command processed successfully:');
  console.log('----------------------------');
  console.log('Demonstrative Type:', data.demonstrativeType);
  console.log('Layer Type:', data.layerType);
  if (data.options) {
    console.log('Options:', data.options);
  }
} else if (data.type === 'one') {
  console.log('Command:', data.command);
  if (data.options) {
    console.log('Options:', data.options);
  }
} else if (data.type === 'zero') {
  console.log('No parameters provided');
  if (data.help) {
    console.log('Help requested');
  }
  if (data.version) {
    console.log('Version requested');
  }
}
