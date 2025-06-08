import { assert } from 'jsr:@std/assert@^0.218.2';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../option_validator.ts';
import { DEFAULT_OPTION_RULE } from '../../../types/option_rule.ts';

Deno.test('OptionValidator Structure Tests', async (t) => {
  await t.step('should have correct validation result structure', () => {
    const validator = new ZeroOptionValidator();
    const result = validator.validate([], 'zero', DEFAULT_OPTION_RULE);

    // 結果の構造を検証
    assert('isValid' in result);
    assert('validatedParams' in result);
    assert(Array.isArray(result.validatedParams));
    assert('options' in result || result.options === undefined);
    assert('errorMessage' in result || result.errorMessage === undefined);
    assert('errorCode' in result || result.errorCode === undefined);
    assert('errorCategory' in result || result.errorCategory === undefined);
  });

  await t.step('should handle empty options correctly', () => {
    const validator = new ZeroOptionValidator();
    const result = validator.validate([], 'zero', DEFAULT_OPTION_RULE);

    assert(result.isValid);
    assert(result.validatedParams.length === 0);
    assert(result.options);
    assert(Object.keys(result.options).length === 0);
  });

  await t.step('should handle flag options correctly', () => {
    const validator = new ZeroOptionValidator();
    const result = validator.validate(['--help'], 'zero', DEFAULT_OPTION_RULE);

    assert(result.isValid);
    assert(result.validatedParams.length === 0);
    assert(result.options);
    assert('help' in result.options);
    assert(result.options.help === true);
  });

  await t.step('should handle value options correctly', () => {
    const validator = new OneOptionValidator();
    const result = validator.validate(['--from=test'], 'one', DEFAULT_OPTION_RULE);

    assert(result.isValid);
    assert(result.validatedParams.length === 0);
    assert(result.options);
    assert('from' in result.options);
    assert(result.options.from === 'test');
  });

  await t.step('should handle custom variables correctly', () => {
    const validator = new TwoOptionValidator();
    const result = validator.validate(['--uv-test=value'], 'two', DEFAULT_OPTION_RULE);

    assert(result.isValid);
    assert(result.validatedParams.length === 0);
    assert(result.options);
    assert('uv-test' in result.options);
    assert(result.options['uv-test'] === 'value');
  });
});
