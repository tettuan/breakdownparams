import { assertEquals, assert } from "jsr:@std/assert@^0.218.2";
import { OptionCombinationValidator } from "../option_combination_validator.ts";
import { OptionCombinationRule } from "../option_combination_rule.ts";

Deno.test('OptionCombinationValidator Unit Tests', async (t) => {
  await t.step('should validate standard options correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      requiredOptions: [],
      combinationRules: {}
    };
    
    const validator = new OptionCombinationValidator(rule);
    
    // 許可されたオプション
    const validResult = validator.validate({ test: 'value' });
    assert(validResult.isValid);
    
    // 許可されていないオプション
    const invalidResult = validator.validate({ invalid: 'value' });
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('not allowed'));
    assert(invalidResult.errorCode === 'INVALID_OPTION');
  });

  await t.step('should validate required options correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      requiredOptions: ['test'],
      combinationRules: {}
    };
    
    const validator = new OptionCombinationValidator(rule);
    
    // 必須オプションが指定されている
    const validResult = validator.validate({ test: 'value' });
    assert(validResult.isValid);
    
    // 必須オプションが指定されていない
    const invalidResult = validator.validate({});
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('missing'));
    assert(invalidResult.errorCode === 'MISSING_REQUIRED_OPTION');
  });

  await t.step('should validate combination rules correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['from', 'destination'],
      requiredOptions: [],
      combinationRules: {
        from: ['destination']
      }
    };
    
    const validator = new OptionCombinationValidator(rule);
    
    // 正しい組み合わせ
    const validResult = validator.validate({ from: 'value', destination: 'value' });
    assert(validResult.isValid);
    
    // 不正な組み合わせ
    const invalidResult = validator.validate({ from: 'value' });
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('requires'));
    assert(invalidResult.errorCode === 'INVALID_OPTION_COMBINATION');
  });

  await t.step('should validate custom variables correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: [],
      requiredOptions: [],
      combinationRules: {}
    };
    
    const validator = new OptionCombinationValidator(rule);
    
    // 正しいカスタム変数
    const validResult = validator.validate({ 'uv-test': 'value' });
    assert(validResult.isValid);
    
    // 不正なカスタム変数
    const invalidResult = validator.validate({ 'invalid-var': 'value' });
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid custom variable format'));
    assert(invalidResult.errorCode === 'INVALID_CUSTOM_VARIABLE');
  });

  await t.step('should handle static validate method correctly', () => {
    // 正しい引数
    const validResult = OptionCombinationValidator.validate(['--help'], 'zero');
    assert(validResult.isValid);
    
    // 不正な引数
    const invalidResult = OptionCombinationValidator.validate(['--invalid'], 'zero');
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('not allowed'));
    assert(invalidResult.errorCode === 'INVALID_OPTION');
  });
}); 