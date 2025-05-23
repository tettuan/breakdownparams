import { ParamsParser } from '../src/mod.ts';
import { ParserConfig } from '../src/types.ts';

// Configure extended mode with custom validation
const config: ParserConfig = {
  isExtendedMode: true,
  demonstrativeType: {
    pattern: '^[a-z]+$',
    errorMessage: 'Invalid demonstrative type: must be lowercase letters only',
  },
  layerType: {
    pattern: '^[a-z]+$',
    errorMessage: 'Invalid layer type: must be lowercase letters only',
  },
};

// Create parser instance with extended mode configuration
const parser = new ParamsParser(config);

// Parse command line arguments
const result = parser.parse(Deno.args);

// Handle different result types
if (result.type === 'error') {
  console.error('Error:', result.error);
  Deno.exit(1);
}

if (result.type === 'double') {
  console.log('Demonstrative Type:', result.demonstrativeType);
  console.log('Layer Type:', result.layerType);
  console.log('Options:', result.options);
} else if (result.type === 'single') {
  console.log('Command:', result.command);
  console.log('Options:', result.options);
} else if (result.type === 'no-params') {
  console.log('No parameters provided');
  if (result.help) {
    console.log('Help requested');
  }
  if (result.version) {
    console.log('Version requested');
  }
} 