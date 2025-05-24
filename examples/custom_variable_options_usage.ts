import { ParamsParser } from '../mod.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: custom_variable_options_usage <command> <layer> [options]

Commands:
  to, summary, defect

Layers:
  project, issue, task (and their aliases)

Options:
  --from, -f <file>          Input file path
  --destination, -o <file>    Output file path
  --input, -i <layer>        Input layer type
  --adaptation, -a <type>    Prompt adaptation type
  --uv-* <value>            Custom variable options (only available with DoubleParams)

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
  - Custom variables are only available with DoubleParams mode
  - Custom variable names are case-sensitive
  - Custom variables must use the --uv- prefix
  - Custom variables must have a value (--uv-name=value format)
  - Multiple custom variables can be specified
  - Custom variables are ignored in NoParams and SingleParam modes
`);
}

// Display help if requested
if (result.type === 'no-params' && result.help) {
  showUsage();
  Deno.exit(0);
}

// Handle any errors
if ('error' in result && result.error) {
  console.error(`Error: ${result.error.message}`);
  if (result.error.details) {
    console.error('Details:', result.error.details);
  }
  console.log('\nFor usage information, run: custom_variable_options_usage --help');
  Deno.exit(1);
}

// Process valid command
if (result.type === 'double') {
  const { demonstrativeType, layerType, options = {} } = result;

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
  if (options?.customVariables) {
    console.log('\nCustom Variables:');
    console.log('----------------');
    for (const [name, value] of Object.entries(options.customVariables)) {
      console.log(`${name}: ${value}`);
    }
  }
} else {
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: custom_variable_options_usage --help');
  Deno.exit(1);
} 