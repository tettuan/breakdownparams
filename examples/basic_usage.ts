import { ParamsParser } from '../src/mod.ts';
import { ParamPatternResult } from '../src/core/params/types.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

if (!result.success) {
  console.error(`Error: ${result.error?.message}`);
  Deno.exit(1);
}

const data = result.data as ParamPatternResult;

switch (data.type) {
  case 'zero': {
    if (data.help) {
      console.log(`
Usage: basic_usage [command] [options]

Commands:
  init                Initialize a new project
  to <layer>         Convert to specified layer
  summary <layer>    Generate summary for layer
  defect <layer>     Report defects for layer

Layers:
  project            Project level
  issue             Issue level
  task              Task level

Options:
  -h, --help        Show this help message
  -v, --version     Show version number
  -f, --from=FILE   Source file path
  -o, --destination=FILE Output file path
  -i, --input=TYPE  Input layer type
  -c, --config=NAME Configuration file name
`);
    } else if (data.version) {
      console.log('v0.1.0');
    }
    break;
  }

  case 'one': {
    if (data.command === 'init') {
      console.log('Initializing new project...');
      // Add initialization logic here
    }
    break;
  }

  case 'two': {
    const { demonstrativeType, layerType, options = {} } = data;
    console.log(`Action: ${demonstrativeType} ${layerType}`);

    if (options.fromFile) {
      console.log(`Input file: ${options.fromFile}`);
    }
    if (options.destinationFile) {
      console.log(`Output file: ${options.destinationFile}`);
    }
    if (options.fromLayerType) {
      console.log(`Converting from layer: ${options.fromLayerType}`);
    }
    if (options.configFile) {
      console.log(`Using config: ${options.configFile}`);
    }
    break;
  }
}
