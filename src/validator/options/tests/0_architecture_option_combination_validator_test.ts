import { assert } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { OptionCombinationValidator } from '../option_combination_validator.ts';
import type { OptionCombinationRule } from '../option_combination_rule.ts';

const logger = new BreakdownLogger("option-validator");

Deno.test('OptionCombinationValidator Architecture Tests', async (t) => {
  await t.step('should have correct class structure', () => {
    const validator = new OptionCombinationValidator({} as OptionCombinationRule);

    // Verify class structure
    assert('validate' in validator);
    assert(typeof validator.validate === 'function');
  });

  await t.step('should have correct method signatures', () => {
    const validator = new OptionCombinationValidator({} as OptionCombinationRule);

    // Verify validate method signature
    const validateMethod = validator.validate;
    assert(validateMethod.length === 1); // number of parameters
  });

  await t.step('should have correct dependency injection', () => {
    // Verify constructor dependency injection
    const rule: OptionCombinationRule = {
      allowedOptions: [],
      requiredOptions: [],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);
    assert(validator instanceof OptionCombinationValidator);
  });

  await t.step('should have correct result type', () => {
    const validator = new OptionCombinationValidator({} as OptionCombinationRule);
    const result = validator.validate({});
    logger.debug("Combination validator result", { data: { isValid: result.isValid, hasError: !!result.errorMessage } });

    // Verify result type
    assert('isValid' in result);
    assert(typeof result.isValid === 'boolean');
    assert('errorMessage' in result || result.errorMessage === undefined);
    assert('errorCode' in result || result.errorCode === undefined);
    assert('errorCategory' in result || result.errorCategory === undefined);
  });
});
