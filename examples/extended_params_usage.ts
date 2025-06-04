import { ParamsParser } from '../src/mod.ts';
import { ParamsResult, ZeroParamsResult, OneParamResult, TwoParamResult } from '../src/result/types.ts';

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
if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  console.log('\nFor usage information, run: extended_params_usage --help');
  Deno.exit(1);
}

if (result.type === 'zero') {
  const zeroResult = result as ZeroParamsResult;
  if (zeroResult.options['help'] === 'true') {
    showUsage();
    Deno.exit(0);
  }
}

if (result.type === 'two') {
  const twoResult = result as TwoParamResult;
  console.log('Command processed successfully:');
  console.log('----------------------------');
  console.log('Demonstrative Type:', twoResult.demonstrativeType);
  console.log('Layer Type:', twoResult.layerType);
  if (Object.keys(twoResult.options).length > 0) {
    console.log('Options:', twoResult.options);
  }
} else if (result.type === 'one') {
  const oneResult = result as OneParamResult;
  console.log('Command:', oneResult.demonstrativeType);
  if (Object.keys(oneResult.options).length > 0) {
    console.log('Options:', oneResult.options);
  }
} else if (result.type === 'zero') {
  console.log('No parameters provided');
  if (result.options['help'] === 'true') {
    console.log('Help requested');
  }
  if (result.options['version'] === 'true') {
    console.log('Version requested');
  }
}
