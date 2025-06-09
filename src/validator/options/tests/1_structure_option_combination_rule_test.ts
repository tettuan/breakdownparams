import { assert } from 'jsr:@std/assert@^0.218.2';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../option_combination_rule.ts';

Deno.test('OptionCombinationRule Structure Tests', async (t) => {
  await t.step('should have correct default rules structure', () => {
    // デフォルトルールの存在確認
    assert(DEFAULT_OPTION_COMBINATION_RULES.zero !== undefined);
    assert(DEFAULT_OPTION_COMBINATION_RULES.one !== undefined);
    assert(DEFAULT_OPTION_COMBINATION_RULES.two !== undefined);
  });

  await t.step('should have correct zero options structure', () => {
    const zeroRules = DEFAULT_OPTION_COMBINATION_RULES.zero;
    assert(Array.isArray(zeroRules.allowedOptions));
    assert(zeroRules.allowedOptions.includes('help'));
    assert(zeroRules.allowedOptions.includes('version'));
    assert(!zeroRules.requiredOptions); // zero options には必須オプションなし
    assert(!zeroRules.combinationRules); // zero options には組み合わせルールなし
  });

  await t.step('should have correct one options structure', () => {
    const oneRules = DEFAULT_OPTION_COMBINATION_RULES.one;
    assert(Array.isArray(oneRules.allowedOptions));
    assert(oneRules.allowedOptions.includes('config'));
    assert(!oneRules.requiredOptions); // one options には必須オプションなし
    assert(!oneRules.combinationRules); // one options には組み合わせルールなし
  });

  await t.step('should have correct two options structure', () => {
    const twoRules = DEFAULT_OPTION_COMBINATION_RULES.two;
    assert(Array.isArray(twoRules.allowedOptions));
    assert(twoRules.allowedOptions.includes('from'));
    assert(twoRules.allowedOptions.includes('destination'));
    assert(twoRules.allowedOptions.includes('config'));
    assert(twoRules.allowedOptions.includes('adaptation'));
    assert(twoRules.allowedOptions.includes('input'));

    // 必須オプションの検証 - two rules には必須オプションなし
    assert(!twoRules.requiredOptions);

    // 組み合わせルールの検証 - 現在は組み合わせルールなし
    assert(!twoRules.combinationRules);
  });
});
