import { assertEquals, assert } from "jsr:@std/assert@^0.218.2";
import { OptionCombinationRule, OptionCombinationRules } from "../option_combination_rule.ts";

Deno.test('OptionCombinationRule Architecture Tests', async (t) => {
  await t.step('should maintain correct interface structure', () => {
    // OptionCombinationRule インターフェースの構造検証
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      requiredOptions: ['test'],
      combinationRules: { test: ['test2'] }
    };

    assert('allowedOptions' in rule);
    assert(Array.isArray(rule.allowedOptions));
    assert('requiredOptions' in rule);
    assert(Array.isArray(rule.requiredOptions));
    assert('combinationRules' in rule);
    assert(typeof rule.combinationRules === 'object');
  });

  await t.step('should maintain correct rules type structure', () => {
    // OptionCombinationRules インターフェースの構造検証
    const rules: OptionCombinationRules = {
      zero: { allowedOptions: ['test'] },
      one: { allowedOptions: ['test'] },
      two: { allowedOptions: ['test'] }
    };

    assert('zero' in rules);
    assert('one' in rules);
    assert('two' in rules);
    assert(rules.zero instanceof Object);
    assert(rules.one instanceof Object);
    assert(rules.two instanceof Object);
  });

  await t.step('should maintain type safety for combination rules', () => {
    // 型安全性の検証
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      combinationRules: {
        test: ['test2']
      }
    };

    assert(rule.combinationRules?.test instanceof Array);
    assert(rule.combinationRules?.test[0] === 'test2');
  });
}); 