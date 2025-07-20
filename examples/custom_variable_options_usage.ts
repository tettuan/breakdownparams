import { ParamsParser } from '../src/mod.ts';
import type { TwoParamsResult, ZeroParamsResult } from '../src/mod.ts';

// Example arguments for testing
const testArgs = [
  ['to', 'project', '--uv-project=myproject'],
  ['to', 'project', '--uv-project=myproject', '--uv-version=1.0.0', '--uv-environment=production'],
  [
    'to',
    'project',
    '--from=input.txt',
    '--destination=output.txt',
    '--uv-project=myproject',
    '--uv-version=1.0.0',
  ],
  ['summary', 'issue', '--uv-name=value', '--uv-type=test'],
];

// Run tests for each argument set
for (const args of testArgs) {
  console.log(`\n=== Testing: ${args.join(' ')} ===`);

  const parser = new ParamsParser();
  const result = parser.parse(args);

  if (result.type === 'error') {
    console.error(`Error: ${result.error?.message}`);
    console.log('\nFor usage information, run: custom_variable_options_usage --help');
    continue;
  }

  if (result.type === 'zero') {
    const zeroResult = result as ZeroParamsResult;
    const options = zeroResult.options as { help?: boolean };

    if (options.help) {
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

  # Custom variables with different directive types
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
  }

  // Process valid command
  if (result.type === 'two') {
    const twoResult = result as TwoParamsResult;
    const { directiveType, layerType, options = {} } = twoResult;

    console.log('Command processed successfully:');
    console.log('----------------------------');
    console.log(`Action: ${directiveType} ${layerType}`);

    // Display standard options
    const typedOptions = options as {
      from?: string;
      destination?: string;
      input?: string;
      adaptation?: string;
      [key: string]: unknown;
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

    // Display custom variables
    const customVars = Object.entries(options).filter(([key]) => key.startsWith('uv-'));
    if (customVars.length > 0) {
      console.log('\nCustom Variables:');
      console.log('----------------');
      for (const [key, value] of customVars) {
        console.log(`${key}=${value}`);
      }
    }
  }
}
