// deno-lint-ignore-file no-console
import { ParamsParser } from '../src/mod.ts';
import type { ParamsResult, TwoParamsResult } from '../src/mod.ts';

/**
 * User variables test example
 *
 * This example tests the user variable options (--uv-*) support.
 * According to docs/user_variable_options.md, these should work in TwoParams mode.
 */

console.log('=== User Variables Test ===\n');

// Test cases for user variable options
const testCases = [
  {
    name: 'Basic user variable',
    args: ['to', 'project', '--uv-project=myproject'],
    expected: 'Should accept user variable',
  },
  {
    name: 'Multiple user variables',
    args: ['to', 'project', '--uv-project=myproject', '--uv-version=1.0.0', '--uv-env=production'],
    expected: 'Should accept multiple user variables',
  },
  {
    name: 'User variables with standard options',
    args: ['to', 'project', '--from=input.md', '--uv-project=myproject', '--destination=output.md'],
    expected: 'Should work with standard options',
  },
  {
    name: 'User variable with complex value',
    args: ['to', 'project', '--uv-config={"key":"value","array":[1,2,3]}'],
    expected: 'Should accept JSON-like values',
  },
  {
    name: 'User variable with path value',
    args: ['to', 'project', '--uv-path=/usr/local/bin'],
    expected: 'Should accept path values',
  },
  {
    name: 'User variable with empty value',
    args: ['to', 'project', '--uv-empty='],
    expected: 'Should accept empty values',
  },
  {
    name: 'User variables in OneParam mode',
    args: ['init', '--uv-test=value'],
    expected: 'Should be ignored in OneParam mode',
  },
  {
    name: 'User variables in ZeroParams mode',
    args: ['--help', '--uv-test=value'],
    expected: 'Should be ignored in ZeroParams mode',
  },
  {
    name: 'Invalid user variable (no equals)',
    args: ['to', 'project', '--uv-invalid'],
    expected: 'Should error on invalid syntax',
  },
  {
    name: 'Invalid user variable name (special chars)',
    args: ['to', 'project', '--uv-test@name=value'],
    expected: 'Should error on invalid characters',
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
      const twoResult = result as TwoParamsResult;
      const options = twoResult.options as Record<string, unknown>;

      // Check for user variables
      const customVars = Object.entries(options).filter(([key]) => key.startsWith('uv-'));
      const standardOpts = Object.entries(options).filter(([key]) => !key.startsWith('uv-'));

      if (standardOpts.length > 0) {
        console.log(`   Standard options: ${JSON.stringify(Object.fromEntries(standardOpts))}`);
      }

      if (customVars.length > 0) {
        console.log(`   User variables found:`);
        for (const [key, value] of customVars) {
          console.log(`     ${key} = ${value}`);
        }
      } else {
        console.log('   No user variables found in options');
      }
    } else if (result.type === 'one' || result.type === 'zero') {
      const options = result.options as Record<string, unknown>;
      const hasCustomVars = Object.keys(options).some((key) => key.startsWith('uv-'));
      if (hasCustomVars) {
        console.log('   ⚠️  User variables present (should be ignored)');
      }
    }
  }
  console.log('---\n');
}

// Summary
console.log('=== Summary ===');
console.log('User variable options (--uv-*) are documented but not implemented.');
console.log('All user variable options result in "Option \'uv-xxx\' is not allowed" error.');
console.log('This needs to be fixed in src/validator/options/user_variable_validator.ts');
console.log('or the option parsing logic needs to recognize --uv-* pattern.');
