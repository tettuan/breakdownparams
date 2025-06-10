import { ParamsParser } from '../src/mod.ts';
import type { ParamsResult } from '../src/mod.ts';

/**
 * Short form options test example
 *
 * This example tests the short form option support.
 * According to the documentation, these should work but currently don't.
 */

console.log('=== Short Form Options Test ===\n');

// Test cases for short form options
const testCases = [
  {
    name: 'Long form options (baseline)',
    args: ['to', 'project', '--from=input.md', '--destination=output.md'],
    expected: 'Should work correctly',
  },
  {
    name: 'Short form -f (from)',
    args: ['to', 'project', '-f=input.md'],
    expected: 'Should be equivalent to --from=input.md',
  },
  {
    name: 'Short form -o (destination)',
    args: ['to', 'project', '-o=output.md'],
    expected: 'Should be equivalent to --destination=output.md',
  },
  {
    name: 'Short form -c (config)',
    args: ['to', 'project', '-c=test.json'],
    expected: 'Should be equivalent to --config=test.json',
  },
  {
    name: 'Short form -i (input)',
    args: ['to', 'project', '-i=task'],
    expected: 'Should be equivalent to --input=task',
  },
  {
    name: 'Short form -a (adaptation)',
    args: ['to', 'project', '-a=strict'],
    expected: 'Should be equivalent to --adaptation=strict',
  },
  {
    name: 'Mixed long and short forms',
    args: ['to', 'project', '--from=input.md', '-o=output.md', '-c=test.json'],
    expected: 'Should work with mixed forms',
  },
  {
    name: 'Short form for help',
    args: ['-h'],
    expected: 'Should show help',
  },
  {
    name: 'Short form for version',
    args: ['-v'],
    expected: 'Should show version',
  },
];

// Run tests
for (const testCase of testCases) {
  console.log(`Test: ${testCase.name}`);
  console.log(`Args: ${testCase.args.join(' ')}`);
  console.log(`Expected: ${testCase.expected}`);

  const parser = new ParamsParser();
  const result = parser.parse(testCase.args) as ParamsResult;

  if (result.type === 'error') {
    console.log(`❌ Error: ${result.error?.message}`);
    console.log(`   Code: ${result.error?.code}`);
  } else {
    console.log(`✅ Success: type=${result.type}`);
    if (result.type === 'two') {
      const options = result.options as Record<string, unknown>;
      if (Object.keys(options).length > 0) {
        console.log(`   Options: ${JSON.stringify(options)}`);
      }
    } else if (result.type === 'zero') {
      const options = result.options as { help?: boolean; version?: boolean };
      if (options.help) {
        console.log('   Help flag detected');
      }
      if (options.version) {
        console.log('   Version flag detected');
      }
    }
  }
  console.log('---\n');
}

// Summary
console.log('=== Summary ===');
console.log('Short form options are documented in docs/options.md but not implemented.');
console.log('All short form options result in "Expected zero parameters" error.');
console.log('This needs to be fixed in src/parser/params_parser.ts.');
