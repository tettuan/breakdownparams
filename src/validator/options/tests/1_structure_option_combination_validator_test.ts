import { assert } from 'jsr:@std/assert@^0.218.2';
import { OptionCombinationValidator } from '../option_combination_validator.ts';
import { OptionCombinationRule } from '../option_combination_rule.ts';

Deno.test('OptionCombinationValidator Structure Tests', async (t) => {
  await t.step('should have correct validation result structure', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: [],
      requiredOptions: [],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);
    const result = validator.validate({});

    // 結果の構造を検証
    assert('isValid' in result);
    assert(typeof result.isValid === 'boolean');
    assert('errorMessage' in result || result.errorMessage === undefined);
    assert('errorCode' in result || result.errorCode === undefined);
    assert('errorCategory' in result || result.errorCategory === undefined);
  });

  await t.step('should handle empty options correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: [],
      requiredOptions: [],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);
    const result = validator.validate({});

    assert(result.isValid);
    assert(!result.errorMessage);
    assert(!result.errorCode);
    assert(!result.errorCategory);
  });

  await t.step('should handle required options structure', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      requiredOptions: ['test'],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);
    const result = validator.validate({});

    assert(!result.isValid);
    assert(result.errorMessage?.includes('missing'));
    assert(result.errorCode === 'MISSING_REQUIRED_OPTION');
    assert(result.errorCategory === 'validation');
  });

  await t.step('should handle combination rules structure', () => {
    // Create a custom rule to test combination logic
    const rule: OptionCombinationRule = {
      allowedOptions: ['option1', 'option2'],
      requiredOptions: [],
      combinationRules: {
        option1: ['option2'],
      },
    };

    const validator = new OptionCombinationValidator(rule);
    const result = validator.validate({ option1: 'value' });

    assert(!result.isValid);
    assert(result.errorMessage?.includes('requires'));
    assert(result.errorCode === 'INVALID_OPTION_COMBINATION');
    assert(result.errorCategory === 'validation');
  });
});
