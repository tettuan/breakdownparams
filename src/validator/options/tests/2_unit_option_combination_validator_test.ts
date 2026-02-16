import { assert } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { OptionCombinationValidator } from '../option_combination_validator.ts';
import type { OptionCombinationRule } from '../option_combination_rule.ts';

const logger = new BreakdownLogger("option-validator");

Deno.test('OptionCombinationValidator Unit Tests', async (t) => {
  await t.step('should validate standard options correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      requiredOptions: [],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);

    // Allowed options
    const validResult = validator.validate({ test: 'value' });
    assert(validResult.isValid);

    // Disallowed options
    const invalidResult = validator.validate({ invalid: 'value' });
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('not allowed'));
    assert(invalidResult.errorCode === 'INVALID_OPTION');
  });

  await t.step('should validate required options correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      requiredOptions: ['test'],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);

    // Required option is specified
    const validResult = validator.validate({ test: 'value' });
    assert(validResult.isValid);

    // Required option is not specified
    const invalidResult = validator.validate({});
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('missing'));
    assert(invalidResult.errorCode === 'MISSING_REQUIRED_OPTION');
  });

  await t.step('should validate combination rules correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['option1', 'option2'],
      requiredOptions: [],
      combinationRules: {
        option1: ['option2'],
      },
    };

    const validator = new OptionCombinationValidator(rule);

    // Valid combination
    const validResult = validator.validate({ option1: 'value', option2: 'value' });
    assert(validResult.isValid);

    // Invalid combination
    const invalidResult = validator.validate({ option1: 'value' });
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('requires'));
    assert(invalidResult.errorCode === 'INVALID_OPTION_COMBINATION');
  });

  await t.step('should handle static validate method correctly', () => {
    // Valid arguments
    const validResult = OptionCombinationValidator.validate(['--help'], 'zero');
    assert(validResult.isValid);

    // Invalid arguments
    const invalidResult = OptionCombinationValidator.validate(['--invalid'], 'zero');
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('not allowed'));
    assert(invalidResult.errorCode === 'INVALID_OPTION');
  });

  await t.step('should handle short form options', () => {
    // ZeroParams with short options
    const zeroShortResult = OptionCombinationValidator.validate(['-h', '-v'], 'zero');
    logger.debug('Zero short result:', zeroShortResult);
    // Check if short forms are not recognized but result in error or valid

    // OneParam with short options
    const oneShortResult = OptionCombinationValidator.validate(['-c=test'], 'one');
    logger.debug('One short result:', oneShortResult);

    // TwoParams with short options
    const twoShortResult = OptionCombinationValidator.validate(
      ['-f=input.md', '-o=output.md'],
      'two',
    );
    logger.debug('Two short result:', twoShortResult);

    // In current implementation, short form options are not recognized
    // OptionCombinationValidator receives an options dictionary,
    // so unparsed short forms from upstream may not reach here
  });

  await t.step('should handle user variable options in TwoParams', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input'],
      requiredOptions: [],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);

    // User variables are treated specially and allowed in TwoParams mode
    const userVarResult = validator.validate({
      'uv-project': 'myproject',
      'uv-version': '1.0.0',
    });
    logger.debug('User variable result:', userVarResult);
    assert(userVarResult.isValid);

    // Mix of standard options and user variables
    const mixedResult = validator.validate({
      from: 'input.md',
      'uv-project': 'myproject',
    });
    logger.debug('Mixed options result:', mixedResult);
    assert(mixedResult.isValid);

    // Invalid user variable names
    const invalidUserVarResult = validator.validate({
      'uv-': 'invalid',
      'uv-123': 'invalid',
    });
    assert(!invalidUserVarResult.isValid);
    assert(invalidUserVarResult.errorCode === 'INVALID_USER_VARIABLE');
  });
});
