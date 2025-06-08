import { assertEquals, assert } from "jsr:@std/assert@^0.218.2";
import { OptionCombinationValidator } from "../option_combination_validator.ts";
import { OptionCombinationRule } from "../option_combination_rule.ts";

Deno.test('OptionCombinationValidator Architecture Tests', async (t) => {
  await t.step('should have correct class structure', () => {
    const validator = new OptionCombinationValidator({} as OptionCombinationRule);
    
    // クラスの構造を検証
    assert('validate' in validator);
    assert(typeof validator.validate === 'function');
  });

  await t.step('should have correct method signatures', () => {
    const validator = new OptionCombinationValidator({} as OptionCombinationRule);
    
    // validate メソッドのシグネチャを検証
    const validateMethod = validator.validate;
    assert(validateMethod.length === 1); // パラメータの数
  });

  await t.step('should have correct dependency injection', () => {
    // コンストラクタの依存性注入を検証
    const rule: OptionCombinationRule = {
      allowedOptions: [],
      requiredOptions: [],
      combinationRules: {}
    };
    
    const validator = new OptionCombinationValidator(rule);
    assert(validator instanceof OptionCombinationValidator);
  });

  await t.step('should have correct result type', () => {
    const validator = new OptionCombinationValidator({} as OptionCombinationRule);
    const result = validator.validate({});
    
    // 結果の型を検証
    assert('isValid' in result);
    assert(typeof result.isValid === 'boolean');
    assert('errorMessage' in result || result.errorMessage === undefined);
    assert('errorCode' in result || result.errorCode === undefined);
    assert('errorCategory' in result || result.errorCategory === undefined);
  });
}); 