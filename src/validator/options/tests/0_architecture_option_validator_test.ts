import { assert } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import {
  OneOptionValidator,
  type OptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../option_validator.ts';
import { DEFAULT_OPTION_RULE, type OptionRule } from '../../../types/option_rule.ts';

const logger = new BreakdownLogger("option-validator");

Deno.test('OptionValidator Architecture Tests', async (t) => {
  await t.step('should have correct interface structure', () => {
    // Verify OptionValidator interface structure
    const validator: OptionValidator = {
      validate: (_args: string[], _type: 'zero' | 'one' | 'two', _optionRule: OptionRule) => ({
        isValid: true,
        validatedParams: [],
        options: {},
      }),
    };

    assert('validate' in validator);
    assert(typeof validator.validate === 'function');
  });

  await t.step('should have correct base class structure', () => {
    // Verify BaseOptionValidator structure
    const validator = new ZeroOptionValidator();

    assert('validate' in validator);
    assert(typeof validator.validate === 'function');
  });

  await t.step('should have correct validator implementations', () => {
    // Verify each validator implementation
    const zeroValidator = new ZeroOptionValidator();
    const oneValidator = new OneOptionValidator();
    const twoValidator = new TwoOptionValidator();

    assert(zeroValidator instanceof ZeroOptionValidator);
    assert(oneValidator instanceof OneOptionValidator);
    assert(twoValidator instanceof TwoOptionValidator);
  });

  await t.step('should have correct method signatures', () => {
    const validator = new ZeroOptionValidator();

    // Verify validate method signature
    const validateMethod = validator.validate;
    assert(validateMethod.length === 3); // number of parameters
  });

  await t.step('should have correct result type', () => {
    const validator = new ZeroOptionValidator();
    const result = validator.validate([], 'zero', DEFAULT_OPTION_RULE);
    logger.debug("Architecture validation result", { data: { isValid: result.isValid, hasOptions: 'options' in result } });

    // Verify result type
    assert('isValid' in result);
    assert(typeof result.isValid === 'boolean');
    assert('validatedParams' in result);
    assert(Array.isArray(result.validatedParams));
    assert('options' in result || result.options === undefined);
    assert('errorMessage' in result || result.errorMessage === undefined);
    assert('errorCode' in result || result.errorCode === undefined);
    assert('errorCategory' in result || result.errorCategory === undefined);
  });
});
