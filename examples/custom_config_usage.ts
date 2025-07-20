import { ParamsParser } from '../src/parser/params_parser.ts';
import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../src/types/custom_config.ts';
import type { TwoParamsResult } from '../src/types/params_result.ts';

// Custom configuration for a task breakdown tool
const customConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  params: {
    two: {
      // Allow natural English directive types
      directiveType: {
        pattern: '^(breakdown|split|divide|analyze|convert)$',
        errorMessage: 'Invalid action. Must be one of: breakdown, split, divide, analyze, convert',
      },
      // Allow descriptive layer types
      layerType: {
        pattern: '^(simple|detailed|atomic|manageable|smaller|pieces|steps|chunks)$',
        errorMessage:
          'Invalid target. Must be one of: simple, detailed, atomic, manageable, smaller, pieces, steps, chunks',
      },
    },
  },
};

// Create parser with custom configuration
const parser = new ParamsParser(undefined, customConfig);

// Example commands to test
const examples = [
  // Basic breakdown examples
  ['breakdown', 'simple', '--from=complex-task.md'],
  ['breakdown', 'manageable', '--from=big-project.md', '--destination=tasks/'],
  ['split', 'smaller', '--from=monolith.ts', '--config=split-rules.json'],
  ['divide', 'pieces', '--from=large-file.txt', '--adaptation=context-aware'],

  // Analysis examples
  ['analyze', 'detailed', '--from=codebase/', '--input=directory'],
  ['analyze', 'atomic', '--from=requirements.doc', '--destination=analysis.md'],

  // Conversion examples
  ['convert', 'simple', '--from=technical-spec.md', '--adaptation=non-technical'],
  ['convert', 'steps', '--from=algorithm.py', '--destination=tutorial.md'],

  // With custom variables
  ['breakdown', 'chunks', '--from=dataset.csv', '--uv-size=1000', '--uv-format=json'],
  ['split', 'pieces', '--from=video.mp4', '--uv-duration=5min', '--uv-quality=high'],

  // Invalid examples
  ['destroy', 'simple'], // Invalid directive type
  ['breakdown', 'tiny'], // Invalid layer type
];

console.log('=== Custom Configuration Examples ===\n');
console.log('This example demonstrates a task breakdown tool with natural English commands.\n');

for (const args of examples) {
  console.log(`Command: ${args.join(' ')}`);
  const result = parser.parse(args);

  if (result.type === 'error') {
    console.log(`❌ Error: ${result.error?.message}`);
  } else if (result.type === 'two') {
    const twoResult = result as TwoParamsResult;
    console.log(`✅ Valid command:`);
    console.log(`   Action: ${twoResult.directiveType}`);
    console.log(`   Target: ${twoResult.layerType}`);
    if (Object.keys(twoResult.options).length > 0) {
      console.log(`   Options:`);
      for (const [key, value] of Object.entries(twoResult.options)) {
        console.log(`     - ${key}: ${value}`);
      }
    }
  }
  console.log('');
}

// Show help-like information
console.log('=== Usage Guide ===\n');
console.log('This tool helps you break down complex tasks into manageable pieces.\n');
console.log('Actions:');
console.log('  breakdown  - Break down complex structures into simpler parts');
console.log('  split      - Split large items into smaller chunks');
console.log('  divide     - Divide content into logical pieces');
console.log('  analyze    - Analyze and break down for understanding');
console.log('  convert    - Convert complex formats to simpler ones\n');
console.log('Targets:');
console.log('  simple     - Simple, easy-to-understand format');
console.log('  detailed   - Detailed breakdown with full information');
console.log('  atomic     - Smallest possible units');
console.log('  manageable - Manageable sized pieces');
console.log('  smaller    - Smaller components');
console.log('  pieces     - Individual pieces');
console.log('  steps      - Step-by-step breakdown');
console.log('  chunks     - Data chunks of specific size\n');
console.log('Options:');
console.log('  --from=FILE         Source file or directory');
console.log('  --destination=PATH  Output location');
console.log('  --config=FILE       Configuration file');
console.log('  --adaptation=TYPE   Adaptation strategy');
console.log('  --input=TYPE        Input type specification');
console.log('  --uv-*              Custom variables (e.g., --uv-size=1000)');
