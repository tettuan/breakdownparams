import { ParamsParser } from '../src/mod.ts';
import { ZeroParamsResult } from '../src/result/types.ts';

// 実行例のパラメータを定義
const exampleArgs = ['--help'];

console.log('Example: Using help option');
console.log('------------------------');
console.log('Command:', exampleArgs.join(' '));
console.log();

const parser = new ParamsParser();
const result = parser.parse(exampleArgs);

if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  Deno.exit(1);
}

if (result.type === 'zero') {
  const zeroResult = result as ZeroParamsResult;
  if (zeroResult.options.help) {
    console.log(`
Usage: breakdown [command] [options]

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
  }
} else {
  console.error('Expected ZeroParams result but got:', result.type);
  Deno.exit(1);
} 