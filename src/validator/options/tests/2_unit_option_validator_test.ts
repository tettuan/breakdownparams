import { assert } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../option_validator.ts';
import { DEFAULT_OPTION_RULE } from '../../../types/option_rule.ts';

const logger = new BreakdownLogger('option-validator');

Deno.test('OptionValidator Unit Tests', async (t) => {
  await t.step('should validate zero options correctly', () => {
    const validator = new ZeroOptionValidator();

    // Valid options
    const validResult = validator.validate(['--help'], 'zero', DEFAULT_OPTION_RULE);
    assert(validResult.isValid);
    assert(validResult.options?.help === true);

    // Invalid options
    const invalidResult = validator.validate(['--invalid'], 'zero', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should validate one options correctly', () => {
    const validator = new OneOptionValidator();

    // No options
    const validResult = validator.validate([], 'one', DEFAULT_OPTION_RULE);
    assert(validResult.isValid);
    assert(Object.keys(validResult.options || {}).length === 0);

    // All options are invalid
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

    // Valid options
    const validResult = validator.validate(
      ['--from=test', '--destination=test'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    assert(validResult.isValid);
    assert(validResult.options?.from === 'test');
    assert(validResult.options?.destination === 'test');

    // Invalid options
    const invalidResult = validator.validate(['--invalid=test'], 'two', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should handle invalid parameter type', () => {
    const validator = new ZeroOptionValidator();

    // Invalid parameter type
    const result = validator.validate(['--help'], 'one', DEFAULT_OPTION_RULE);
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Invalid parameter type'));
    assert(result.errorCode === 'INVALID_PARAMETER_TYPE');
  });

  await t.step('should handle user variables in two options', () => {
    const validator = new TwoOptionValidator();

    // Valid user variables
    const validResult = validator.validate(['--uv-test=value'], 'two', DEFAULT_OPTION_RULE);
    assert(validResult.isValid);
    assert(validResult.options?.['uv-test'] === 'value');

    // Invalid user variables
    const invalidResult = validator.validate(['--invalid-var=value'], 'two', DEFAULT_OPTION_RULE);
    assert(!invalidResult.isValid);
    assert(invalidResult.errorMessage?.includes('Invalid options'));
    assert(invalidResult.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should handle empty values correctly', () => {
    const validator = new TwoOptionValidator();

    // Empty value
    const result = validator.validate(['--from='], 'two', DEFAULT_OPTION_RULE);
    assert(!result.isValid);
    assert(result.errorMessage?.includes('Empty value not allowed'));
    assert(result.errorCode === 'INVALID_OPTIONS');
  });

  await t.step('should handle short form options - ZeroParams', () => {
    const validator = new ZeroOptionValidator();

    // Short form help option
    const helpResult = validator.validate(['-h'], 'zero', DEFAULT_OPTION_RULE);
    logger.debug('Short help result:', helpResult);
    // Currently not recognized, options will be empty
    assert(helpResult.isValid);
    assert(Object.keys(helpResult.options || {}).length === 0, 'Short options are not recognized');

    // Short form version option
    const versionResult = validator.validate(['-v'], 'zero', DEFAULT_OPTION_RULE);
    logger.debug('Short version result:', versionResult);
    assert(versionResult.isValid);
    assert(
      Object.keys(versionResult.options || {}).length === 0,
      'Short options are not recognized',
    );
  });

  await t.step('should handle short form options - OneParam', () => {
    const validator = new OneOptionValidator();

    // Short form options
    const shortResult = validator.validate(['-f=input.md'], 'one', DEFAULT_OPTION_RULE);
    logger.debug('OneParam short result:', shortResult);
    // Currently not recognized, options will be empty
    assert(shortResult.isValid);
    assert(Object.keys(shortResult.options || {}).length === 0, 'Short options are not recognized');
  });

  await t.step('should handle short form options - TwoParams', () => {
    const validator = new TwoOptionValidator();

    // Short form options
    const shortResult = validator.validate(
      ['-f=input.md', '-o=output.md'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    logger.debug('TwoParams short result:', shortResult);
    // Currently not recognized, options will be empty
    assert(shortResult.isValid);
    assert(Object.keys(shortResult.options || {}).length === 0, 'Short options are not recognized');

    // Mix of long and short forms
    const mixedResult = validator.validate(
      ['--from=input.md', '-o=output.md'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    logger.debug('Mixed options result:', mixedResult);
    // Only long form is recognized
    assert(mixedResult.isValid);
    assert(mixedResult.options?.from === 'input.md', 'Long form should be recognized');
    assert(!mixedResult.options?.destination, 'Short form -o should not be recognized');
  });

  await t.step('should handle user variable options correctly', () => {
    const validator = new TwoOptionValidator();

    // Should succeed in current test, but fails in actual parser
    const userVarResult = validator.validate(
      ['--uv-project=myproject'],
      'two',
      DEFAULT_OPTION_RULE,
    );
    logger.debug('User variable result in validator:', userVarResult);
    assert(userVarResult.isValid, 'User variables should be valid in TwoParams');
    assert(userVarResult.options?.['uv-project'] === 'myproject');

    // Multiple user variables
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
