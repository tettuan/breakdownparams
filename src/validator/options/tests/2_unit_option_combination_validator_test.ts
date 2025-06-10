import { assert } from 'jsr:@std/assert@^0.218.2';
import { OptionCombinationValidator } from '../option_combination_validator.ts';
import { OptionCombinationRule } from '../option_combination_rule.ts';

Deno.test('OptionCombinationValidator Unit Tests', async (t) => {
  await t.step('should validate standard options correctly', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['test'],
      requiredOptions: [],
      combinationRules: {},
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
      combinationRules: {},
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
      allowedOptions: ['option1', 'option2'],
      requiredOptions: [],
      combinationRules: {
        option1: ['option2'],
      },
    };

    const validator = new OptionCombinationValidator(rule);

    // 正しい組み合わせ
    const validResult = validator.validate({ option1: 'value', option2: 'value' });
    assert(validResult.isValid);

    // 不正な組み合わせ
    const invalidResult = validator.validate({ option1: 'value' });
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('requires'));
    assert(invalidResult.errorCode === 'INVALID_OPTION_COMBINATION');
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

  await t.step('should handle short form options', () => {
    // ZeroParams with short options
    const zeroShortResult = OptionCombinationValidator.validate(['-h', '-v'], 'zero');
    console.log('Zero short result:', zeroShortResult);
    // 短縮形は認識されないが、エラーになるかvalidになるか確認

    // OneParam with short options
    const oneShortResult = OptionCombinationValidator.validate(['-c=test'], 'one');
    console.log('One short result:', oneShortResult);

    // TwoParams with short options
    const twoShortResult = OptionCombinationValidator.validate(
      ['-f=input.md', '-o=output.md'],
      'two',
    );
    console.log('Two short result:', twoShortResult);

    // 現在の実装では短縮形オプションは認識されない
    // OptionCombinationValidatorはオプション辞書を受け取るので、
    // 上流でパースされていない短縮形は到達しない可能性がある
  });

  await t.step('should handle custom variable options in TwoParams', () => {
    const rule: OptionCombinationRule = {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input'],
      requiredOptions: [],
      combinationRules: {},
    };

    const validator = new OptionCombinationValidator(rule);

    // カスタム変数は特別扱いされ、TwoParamsモードでは許可される
    const customVarResult = validator.validate({
      'uv-project': 'myproject',
      'uv-version': '1.0.0',
    });
    console.log('Custom variable result:', customVarResult);
    assert(customVarResult.isValid);

    // 標準オプションとカスタム変数の混在
    const mixedResult = validator.validate({
      from: 'input.md',
      'uv-project': 'myproject',
    });
    console.log('Mixed options result:', mixedResult);
    assert(mixedResult.isValid);

    // 無効なカスタム変数名
    const invalidCustomVarResult = validator.validate({
      'uv-': 'invalid',
      'uv-123': 'invalid',
    });
    assert(!invalidCustomVarResult.isValid);
    assert(invalidCustomVarResult.errorCode === 'INVALID_CUSTOM_VARIABLE');
  });
});
