import { ParamsParser } from '../mod.ts';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

switch (result.type) {
  case 'no-params':
    if (result.help) {
      console.log(`
Usage: basic_usage [command] [options]

Commands:
  init                Initialize a new project
  to <layer>         Convert to specified layer
  summary <layer>    Generate summary for layer
  defect <layer>     Report defects for layer

Layers:
  project (pj)       Project level
  issue (i)         Issue level
  task (t)          Task level

Options:
  -h, --help        Show this help message
  -v, --version     Show version number
`);
    } else if (result.version) {
      console.log('v0.1.0');
    }
    break;

  case 'single':
    if (result.command === 'init') {
      console.log('Initializing new project...');
      // Add initialization logic here
    }
    break;

  case 'double':
    const { demonstrativeType, layerType, options = {} } = result;
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
    break;
}

// If there's an error, display it and exit with status code 1
if ('error' in result && result.error) {
  console.error(`Error: ${result.error}`);
  Deno.exit(1);
} 