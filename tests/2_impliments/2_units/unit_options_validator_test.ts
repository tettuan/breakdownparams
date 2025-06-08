import { ZeroOptionValidator } from '../../../src/validator/options/option_validator.ts';
import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule } from '../../../src/result/types.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--uv-*'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: [],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
};

Deno.test('unit_options_validator_test', async (t) => {
  const validator = new ZeroOptionValidator();

  console.log('[DEBUG] Testing ZeroOptionValidator with different scenarios');

  await t.step('should validate valid options', () => {
    const result = validator.validate(['--help', '--version'], 'zero', optionRule);
    assertEquals(result.isValid, true);
    assertEquals(result.validatedParams, ['--help', '--version']);
  });

  await t.step('should reject invalid options', () => {
    const result = validator.validate(['--invalid-option'], 'zero', optionRule);
    assertEquals(result.isValid, false);
  });

  await t.step('should handle empty values correctly', () => {
    const result = validator.validate(['--key='], 'zero', optionRule);
    assertEquals(result.isValid, false);
  });
});
