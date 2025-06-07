import { ParamsParser } from '../src/mod.ts';
import { ParamsResult, OneParamResult, TwoParamResult } from '../src/result/types.ts';

// デバッグログの出力を制御
const LOG_LEVEL = Deno.env.get('LOG_LEVEL') || 'info';
const isDebug = LOG_LEVEL === 'debug';

const parser = new ParamsParser();
const result = parser.parse(Deno.args);

if (result.error) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  if (isDebug) {
    console.error('Debug information:', result.error);
  }
  console.error('\nFor usage information, run: error_handling --help');
  Deno.exit(1);
}

// Demonstrate successful cases
switch (result.type) {
  case 'zero': {
    console.log('No parameters provided. Use --help to see available options.');
    break;
  }
  case 'one': {
    const oneResult = result as OneParamResult;
    console.log(`Single parameter command: ${oneResult.demonstrativeType}`);
    break;
  }
  case 'two': {
    const twoResult = result as TwoParamResult;
    console.log(`Two parameter command: ${twoResult.demonstrativeType} ${twoResult.layerType}`);
    break;
  }
}
