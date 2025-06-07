import { ParamsParser } from '../src/mod.ts';
import { ParamsResult, ZeroParamsResult, TwoParamResult } from '../src/result/types.ts';

// 実行例のパラメータを定義
const exampleArgs = [
  'to',
  'project',
  '--from=input.md',
  '--destination=output.md',
  '--input=issue',
  '--adaptation=strict'
];

console.log('Example: Using options with TwoParams');
console.log('-----------------------------------');
console.log('Command:', exampleArgs.join(' '));
console.log();

const parser = new ParamsParser();
const result = parser.parse(exampleArgs);

// Helper function to display usage
function showUsage() {
  console.log(`\nUsage: options_usage <command> <layer> [options]\n\nCommands:\n  to, summary, defect\n\nLayers:\n  project, issue, task\n\nOptions:\n  --from=FILE, -f=FILE       Input file path\n  --destination=FILE, -o=FILE Output file path\n  --input=TYPE, -i=TYPE     Input layer type\n  --adaptation=TYPE, -a=TYPE Prompt adaptation type\n\nExamples:\n  # Using long form options\n  options_usage to issue --from=input.md --destination=output.md --input=project --adaptation=strict\n\n  # Using short form options\n  options_usage to issue -f=input.md -o=output.md -i=project -a=strict\n\n  # Mixed options\n  options_usage to issue --from=input.md -o=output.md --input=project -a=strict\n\n  # Using adaptation option only\n  options_usage summary task --adaptation=strict\n`);
}

if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}

if (result.type === 'zero') {
  const zeroResult = result as ZeroParamsResult;
  if (zeroResult.options.help) {
    showUsage();
    Deno.exit(0);
  }
  // ZeroParams で --help 以外は何もしない
  console.log('Please provide both command and layer type.');
  console.log('\nFor usage information, run: options_usage --help');
  Deno.exit(1);
}

if (result.type === 'two') {
  const twoResult = result as TwoParamResult;
  console.log('Command processed successfully:');
  console.log('----------------------------');
  console.log(`Action: ${twoResult.demonstrativeType} ${twoResult.layerType}`);

  if (twoResult.options.from) {
    console.log(`Input file: ${twoResult.options.from}`);
  }
  if (twoResult.options.destination) {
    console.log(`Output file: ${twoResult.options.destination}`);
  }
  if (twoResult.options.input) {
    console.log(`Converting from layer: ${twoResult.options.input}`);
  }
  if (twoResult.options.adaptation) {
    console.log(`Prompt adaptation: ${twoResult.options.adaptation}`);
  }
} else {
  console.error('Expected TwoParams result but got:', result.type);
  Deno.exit(1);
}

// それ以外はエラー
console.log('Please provide both command and layer type.');
console.log('\nFor usage information, run: options_usage --help');
Deno.exit(1);
