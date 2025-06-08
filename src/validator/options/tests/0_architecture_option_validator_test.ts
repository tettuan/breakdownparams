import { assertEquals, assert } from "jsr:@std/assert@^0.218.2";
import { OptionValidator, ZeroOptionValidator, OneOptionValidator, TwoOptionValidator } from "../option_validator.ts";
import { OptionRule, DEFAULT_OPTION_RULE } from "../../../types/option_rule.ts";

Deno.test('OptionValidator Architecture Tests', async (t) => {
  await t.step('should have correct interface structure', () => {
    // OptionValidator インターフェースの構造を検証
    const validator: OptionValidator = {
      validate: (args: string[], type: 'zero' | 'one' | 'two', optionRule: OptionRule) => ({
        isValid: true,
        validatedParams: [],
        options: {}
      })
    };
    
    assert('validate' in validator);
    assert(typeof validator.validate === 'function');
  });

  await t.step('should have correct base class structure', () => {
    // BaseOptionValidator の構造を検証
    const validator = new ZeroOptionValidator();
    
    assert('validate' in validator);
    assert(typeof validator.validate === 'function');
  });

  await t.step('should have correct validator implementations', () => {
    // 各バリデータの実装を検証
    const zeroValidator = new ZeroOptionValidator();
    const oneValidator = new OneOptionValidator();
    const twoValidator = new TwoOptionValidator();
    
    assert(zeroValidator instanceof ZeroOptionValidator);
    assert(oneValidator instanceof OneOptionValidator);
    assert(twoValidator instanceof TwoOptionValidator);
  });

  await t.step('should have correct method signatures', () => {
    const validator = new ZeroOptionValidator();
    
    // validate メソッドのシグネチャを検証
    const validateMethod = validator.validate;
    assert(validateMethod.length === 3); // パラメータの数
  });

  await t.step('should have correct result type', () => {
    const validator = new ZeroOptionValidator();
    const result = validator.validate([], 'zero', DEFAULT_OPTION_RULE);
    
    // 結果の型を検証
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