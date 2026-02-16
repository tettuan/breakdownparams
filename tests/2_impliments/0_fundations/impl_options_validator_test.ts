import { ZeroOptionValidator } from '../../../src/validator/options/option_validator.ts';
import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type { OptionRule } from '../../../src/types/option_rule.ts';

const logger = new BreakdownLogger('option-validator');

const rule: OptionRule = {
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

Deno.test('impl_options_validator_test', async (t) => {
  const validator = new ZeroOptionValidator();

  await t.step('should validate valid options', () => {
    const result = validator.validate(['--help', '--version'], 'zero', rule);
    logger.debug('Valid options validation result', {
      data: { isValid: result.isValid, options: result.options },
    });
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assert(result.options?.help);
    assert(result.options?.version);
  });

  await t.step('should reject invalid options', () => {
    const result = validator.validate(['--invalid-option'], 'zero', rule);
    logger.debug('Invalid options validation result', {
      data: { isValid: result.isValid, errorMessage: result.errorMessage },
    });
    assertFalse(result.isValid);
  });

  await t.step('should handle empty values correctly', () => {
    const result = validator.validate(['--key='], 'zero', rule);
    assertFalse(result.isValid);
  });
});
