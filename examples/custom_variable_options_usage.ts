import { ParamsParser } from '../src/mod.ts';
import { ParamsResult, ZeroParamsResult, OneParamResult, TwoParamResult } from '../src/result/types.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: custom_variable_options_usage <command> <layer> [options]

Commands:
  to, summary, defect

Layers:
  project, issue, task

Options:
  --from=FILE, -f=FILE       Input file path
  --destination=FILE, -o=FILE Output file path
  --input=TYPE, -i=TYPE     Input layer type
  --adaptation=TYPE, -a=TYPE Prompt adaptation type
  --uv-NAME=VALUE          Custom variable options (only available with TwoParams)

Examples:
  # Basic custom variable usage
  custom_variable_options_usage to project --uv-project=myproject

  # Multiple custom variables
  custom_variable_options_usage to project --uv-project=myproject --uv-version=1.0.0 --uv-environment=production

  # Custom variables with standard options
  custom_variable_options_usage to project --from=input.txt --destination=output.txt --uv-project=myproject --uv-version=1.0.0

  # Custom variables with complex values
  custom_variable_options_usage to project --uv-path=/usr/local/bin --uv-config={"key":"value"} --uv-array=[1,2,3]

  # Custom variables with different demonstrative types
  custom_variable_options_usage summary issue --uv-name=value --uv-type=test
  custom_variable_options_usage defect task --uv-name=value --uv-type=test

Notes:
  - Custom variables are only available with TwoParams mode
  - Custom variable names are case-sensitive
  - Custom variables must use the --uv- prefix
  - Custom variables must have a value (--uv-name=value format)
  - Multiple custom variables can be specified
  - Custom variables are ignored in ZeroParams and OneParam modes
`);
}

if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  console.log('\nFor usage information, run: custom_variable_options_usage --help');
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

  // Display standard options
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

  // Display custom variables
  const customVars = Object.entries(twoResult.options).filter(([key]) => key.startsWith('--uv-'));
  if (customVars.length > 0) {
    console.log('\nCustom Variables:');
    console.log('----------------');
    for (const [key, value] of customVars) {
      console.log(`${key}=${value}`);
    }
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: custom_variable_options_usage --help');
  Deno.exit(1);
}
