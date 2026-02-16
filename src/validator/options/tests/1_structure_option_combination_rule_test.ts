import { assert } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../option_combination_rule.ts';

const logger = new BreakdownLogger('option-validator');

Deno.test('OptionCombinationRule Structure Tests', async (t) => {
  await t.step('should have correct default rules structure', () => {
    // Verify default rules exist
    assert(DEFAULT_OPTION_COMBINATION_RULES.zero !== undefined);
    assert(DEFAULT_OPTION_COMBINATION_RULES.one !== undefined);
    assert(DEFAULT_OPTION_COMBINATION_RULES.two !== undefined);
  });

  await t.step('should have correct zero options structure', () => {
    const zeroRules = DEFAULT_OPTION_COMBINATION_RULES.zero;
    logger.debug('Zero rules structure', { data: { allowedOptions: zeroRules.allowedOptions } });
    assert(Array.isArray(zeroRules.allowedOptions));
    assert(zeroRules.allowedOptions.includes('help'));
    assert(zeroRules.allowedOptions.includes('version'));
    assert(!zeroRules.requiredOptions); // zero options has no required options
    assert(!zeroRules.combinationRules); // zero options has no combination rules
  });

  await t.step('should have correct one options structure', () => {
    const oneRules = DEFAULT_OPTION_COMBINATION_RULES.one;
    assert(Array.isArray(oneRules.allowedOptions));
    assert(oneRules.allowedOptions.includes('config'));
    assert(!oneRules.requiredOptions); // one options has no required options
    assert(!oneRules.combinationRules); // one options has no combination rules
  });

  await t.step('should have correct two options structure', () => {
    const twoRules = DEFAULT_OPTION_COMBINATION_RULES.two;
    logger.debug('Two rules structure', { data: { allowedOptions: twoRules.allowedOptions } });
    assert(Array.isArray(twoRules.allowedOptions));
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
});
