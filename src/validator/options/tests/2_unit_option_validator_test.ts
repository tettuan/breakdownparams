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

    // オプションなし
    const validResult = validator.validate([], 'one', DEFAULT_OPTION_RULE);
    assert(validResult.isValid);
    assert(Object.keys(validResult.options || {}).length === 0);

    // どのオプションも無効
    const invalidResult = validator.validate(['--from=test'], 'one', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');

    const invalidResult2 = validator.validate(['--invalid=test'], 'one', DEFAULT_OPTION_RULE);
    assert(!invalidResult2.isValid);
    assert(invalidResult2.errorMessage?.includes('Invalid options'));
    assert(invalidResult2.errorCode === 'INVALID_OPTIONS');
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

  await t.step('should handle user variables in two options', () => {
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
    const validator = new TwoOptionValidator();

    // 空の値
    const result = validator.validate(['--from='], 'two', DEFAULT_OPTION_RULE);
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Empty value not allowed'));
    assert(result.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should handle short form options - ZeroParams', () => {
    const validator = new ZeroOptionValidator();

    // 短縮形ヘルプオプション
    const helpResult = validator.validate(['-h'], 'zero', DEFAULT_OPTION_RULE);
    console.log('Short help result:', helpResult);
    // 現在は認識されず、オプションが空になる
    assert(helpResult.isValid);
    assert(Object.keys(helpResult.options || {}).length === 0, 'Short options are not recognized');

    // 短縮形バージョンオプション
    const versionResult = validator.validate(['-v'], 'zero', DEFAULT_OPTION_RULE);
    console.log('Short version result:', versionResult);
    assert(versionResult.isValid);
    assert(
      Object.keys(versionResult.options || {}).length === 0,
      'Short options are not recognized',
    );
  });

  await t.step('should handle short form options - OneParam', () => {
    const validator = new OneOptionValidator();

    // 短縮形オプション
    const shortResult = validator.validate(['-f=input.md'], 'one', DEFAULT_OPTION_RULE);
    console.log('OneParam short result:', shortResult);
    // 現在は認識されず、オプションが空になる
    assert(shortResult.isValid);
    assert(Object.keys(shortResult.options || {}).length === 0, 'Short options are not recognized');
  });

  await t.step('should handle short form options - TwoParams', () => {
    const validator = new TwoOptionValidator();

    // 短縮形オプション
    const shortResult = validator.validate(
      ['-f=input.md', '-o=output.md'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    console.log('TwoParams short result:', shortResult);
    // 現在は認識されず、オプションが空になる
    assert(shortResult.isValid);
    assert(Object.keys(shortResult.options || {}).length === 0, 'Short options are not recognized');

    // 長形式と短縮形の混在
    const mixedResult = validator.validate(
      ['--from=input.md', '-o=output.md'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    console.log('Mixed options result:', mixedResult);
    // 長形式のみ認識される
    assert(mixedResult.isValid);
    assert(mixedResult.options?.from === 'input.md', 'Long form should be recognized');
    assert(!mixedResult.options?.destination, 'Short form -o should not be recognized');
  });

  await t.step('should handle user variable options correctly', () => {
    const validator = new TwoOptionValidator();

    // 現在のテストでは成功しているはずだが、実際のパーサーでは失敗する
    const userVarResult = validator.validate(
      ['--uv-project=myproject'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    console.log('User variable result in validator:', userVarResult);
    assert(userVarResult.isValid, 'User variables should be valid in TwoParams');
    assert(userVarResult.options?.['uv-project'] === 'myproject');

    // 複数のカスタム変数
    const multiCustomResult = validator.validate(
      ['--uv-project=myproject', '--uv-version=1.0.0'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    assert(multiCustomResult.isValid);
    assert(multiCustomResult.options?.['uv-project'] === 'myproject');
    assert(multiCustomResult.options?.['uv-version'] === '1.0.0');
  });
});
