import { ParamsParser } from '../src/mod.ts';
import { ParamsResult, ZeroParamsResult, OneParamResult, TwoParamResult } from '../src/result/types.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  Deno.exit(1);
}

switch (result.type) {
  case 'zero': {
    const zeroResult = result as ZeroParamsResult;
    if (zeroResult.options['help'] === 'true') {
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
    } else if (zeroResult.options['version'] === 'true') {
      console.log('v0.1.0');
    }
    break;
  }

  case 'one': {
    const oneResult = result as OneParamResult;
    if (oneResult.demonstrativeType === 'init') {
      console.log('Initializing new project...');
      // Add initialization logic here
    }
    break;
  }

  case 'two': {
    const twoResult = result as TwoParamResult;
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
    if (twoResult.options['config']) {
      console.log(`Using config: ${twoResult.options['config']}`);
    }
    break;
  }
}
