import { ZeroOptionValidator } from '../../../src/validator/options/option_validator.ts';
import { assertEquals } from 'jsr:@std/assert@1';
import { OptionRule } from '../../../src/types/option_rule.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  rules: {
    userVariables: ['--uv-*'],
    requiredOptions: [],
    valueTypes: [],
  },
  errorHandling: {
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
  },
  flagOptions: {
    help: true,
    version: true,
  },
};

Deno.test('unit_options_validator_test', async (t) => {
  const validator = new ZeroOptionValidator();

  console.log('[DEBUG] Testing ZeroOptionValidator with different scenarios');

  await t.step('should validate valid options', () => {
    const result = validator.validate(['--help', '--version'], 'zero', optionRule);
    assertEquals(result.isValid, true);
    assertEquals(result.validatedParams, []);
    assertEquals(result.options?.help, true);
    assertEquals(result.options?.version, true);
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
