import { assert } from 'jsr:@std/assert@^0.218.2';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../option_validator.ts';
import { DEFAULT_OPTION_RULE } from '../../../types/option_rule.ts';

Deno.test('OptionValidator Unit Tests', async (t) => {
  await t.step('should validate zero options correctly', () => {
    const validator = new ZeroOptionValidator();

    // 正しいオプション
    const validResult = validator.validate(['--help'], 'zero', DEFAULT_OPTION_RULE);
    assert(validResult.isValid);
    assert(validResult.options?.help === true);

    // 不正なオプション
    const invalidResult = validator.validate(['--invalid'], 'zero', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should validate one options correctly', () => {
    const validator = new OneOptionValidator();

    // 正しいオプション
    const validResult = validator.validate(['--from=test'], 'one', DEFAULT_OPTION_RULE);
    assert(validResult.isValid);
    assert(validResult.options?.from === 'test');

    // 不正なオプション
    const invalidResult = validator.validate(['--invalid=test'], 'one', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should validate two options correctly', () => {
    const validator = new TwoOptionValidator();

    // 正しいオプション
    const validResult = validator.validate(
      ['--from=test', '--destination=test'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    assert(validResult.isValid);
    assert(validResult.options?.from === 'test');
    assert(validResult.options?.destination === 'test');

    // 不正なオプション
    const invalidResult = validator.validate(['--invalid=test'], 'two', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should handle invalid parameter type', () => {
    const validator = new ZeroOptionValidator();

    // 不正なパラメータタイプ
    const result = validator.validate(['--help'], 'one', DEFAULT_OPTION_RULE);
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid parameter type'));
    assert(result.errorCode === 'INVALID_PARAMETER_TYPE');
  });

  await t.step('should handle custom variables in two options', () => {
    const validator = new TwoOptionValidator();

    // 正しいカスタム変数
    const validResult = validator.validate(['--uv-test=value'], 'two', DEFAULT_OPTION_RULE);
    assert(validResult.isValid);
    assert(validResult.options?.['uv-test'] === 'value');

    // 不正なカスタム変数
    const invalidResult = validator.validate(['--invalid-var=value'], 'two', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should handle empty values correctly', () => {
    const validator = new OneOptionValidator();

    // 空の値
    const result = validator.validate(['--from='], 'one', DEFAULT_OPTION_RULE);
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Empty value not allowed'));
    assert(result.errorCode === 'INVALID_OPTIONS');
  });
});
