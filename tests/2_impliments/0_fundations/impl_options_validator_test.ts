import { ZeroOptionValidator } from '../../../src/validator/options/option_validator.ts';
import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionRule } from "../../../src/types/option_rule.ts";

const rule: OptionRule = {
  format: '--key=value',
  rules: {
    customVariables: ['--uv-*'],
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

Deno.test('impl_options_validator_test', async (t) => {
  const validator = new ZeroOptionValidator();

  await t.step('should validate valid options', () => {
    const result = validator.validate(['--help', '--version'], 'zero', rule);
    assertEquals(result.isValid, true);
    assertEquals(result.validatedParams, []);
    assertEquals(result.options?.help, true);
    assertEquals(result.options?.version, true);
  });

  await t.step('should reject invalid options', () => {
    const result = validator.validate(['--invalid-option'], 'zero', rule);
    assertEquals(result.isValid, false);
  });

  await t.step('should handle empty values correctly', () => {
    const result = validator.validate(['--key='], 'zero', rule);
    assertEquals(result.isValid, false);
  });
});
