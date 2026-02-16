import { assert } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../option_combination_rule.ts';

const logger = new BreakdownLogger("option-validator");

Deno.test('OptionCombinationRule Unit Tests', async (t) => {
  await t.step('should validate zero options rules', () => {
    const zeroRules = DEFAULT_OPTION_COMBINATION_RULES.zero;
    logger.debug("Zero options rules", { data: { allowedCount: zeroRules.allowedOptions.length, options: zeroRules.allowedOptions } });

    // Verify allowed options
    assert(zeroRules.allowedOptions.length === 2);
    assert(zeroRules.allowedOptions.includes('help'));
    assert(zeroRules.allowedOptions.includes('version'));

    // Verify required options
    assert(!zeroRules.requiredOptions);
    assert(!zeroRules.combinationRules);
  });

  await t.step('should validate one options rules', () => {
    const oneRules = DEFAULT_OPTION_COMBINATION_RULES.one;

    // Verify allowed options
    assert(oneRules.allowedOptions.length === 1);
    assert(oneRules.allowedOptions.includes('config'));

    // Verify required options
    assert(!oneRules.requiredOptions);
    assert(!oneRules.combinationRules);
  });

  await t.step('should validate two options rules', () => {
    const twoRules = DEFAULT_OPTION_COMBINATION_RULES.two;
    logger.debug("Two options rules", { data: { allowedCount: twoRules.allowedOptions.length, options: twoRules.allowedOptions } });

    // Verify allowed options
    assert(twoRules.allowedOptions.length === 5);
    assert(twoRules.allowedOptions.includes('from'));
    assert(twoRules.allowedOptions.includes('destination'));
    assert(twoRules.allowedOptions.includes('config'));
    assert(twoRules.allowedOptions.includes('adaptation'));
    assert(twoRules.allowedOptions.includes('input'));

    // Verify required options - two rules has no required options
    assert(!twoRules.requiredOptions);

    // Verify combination rules - currently no combination rules
    assert(!twoRules.combinationRules);
  });

  await t.step('should maintain rule consistency', () => {
    const twoRules = DEFAULT_OPTION_COMBINATION_RULES.two;

    // Verify two rules has no required options
    assert(!twoRules.requiredOptions);

    // Verify no combination rules
    assert(!twoRules.combinationRules);
  });
});
