import { ParamsParser } from '../src/mod.ts';
import { ParamPatternResult } from '../src/core/params/types.ts';

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

if (!result.success) {
  console.error(`Error: ${result.error?.message}`);
  console.log('\nFor usage information, run: custom_variable_options_usage --help');
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

  // Display standard options
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

  // Display custom variables
  const customVars = Object.entries(options).filter(([key]) => key.startsWith('--uv-'));
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
