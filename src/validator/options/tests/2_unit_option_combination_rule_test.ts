import { assert } from 'jsr:@std/assert@^0.218.2';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../option_combination_rule.ts';

Deno.test('OptionCombinationRule Unit Tests', async (t) => {
  await t.step('should validate zero options rules', () => {
    const zeroRules = DEFAULT_OPTION_COMBINATION_RULES.zero;

    // 許可オプションの検証
    assert(zeroRules.allowedOptions.length === 2);
    assert(zeroRules.allowedOptions.includes('help'));
    assert(zeroRules.allowedOptions.includes('version'));

    // 必須オプションの検証
    assert(!zeroRules.requiredOptions);
    assert(!zeroRules.combinationRules);
  });

  await t.step('should validate one options rules', () => {
    const oneRules = DEFAULT_OPTION_COMBINATION_RULES.one;

    // 許可オプションの検証
    assert(oneRules.allowedOptions.length === 1);
    assert(oneRules.allowedOptions.includes('config'));

    // 必須オプションの検証
    assert(!oneRules.requiredOptions);
    assert(!oneRules.combinationRules);
  });

  await t.step('should validate two options rules', () => {
    const twoRules = DEFAULT_OPTION_COMBINATION_RULES.two;

    // 許可オプションの検証
    assert(twoRules.allowedOptions.length === 5);
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

  await t.step('should maintain rule consistency', () => {
    const twoRules = DEFAULT_OPTION_COMBINATION_RULES.two;
    
    // two rules には必須オプションがないことを確認
    assert(!twoRules.requiredOptions);

    // 組み合わせルールがないことを確認
    assert(!twoRules.combinationRules);
  });
});
