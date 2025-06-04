import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { BaseValidator } from '../../../src/validator/base_validator.ts';
import { OptionRule, ValidationResult } from '../../../src/result/types.ts';

// BaseValidatorのテスト用サブクラス
class TestValidator extends BaseValidator {
  validate(args: string[]): ValidationResult {
    return {
      isValid: true,
      validatedParams: args,
    };
  }
}

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--demonstrative-type', '--layer-type'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
};

Deno.test('test_base_validator_implementation', () => {
  const validator = new TestValidator(optionRule);

  // バリデーションの実行
  const result = validator.validate(['test']);
  assertEquals(result.isValid, true, 'Validation should be successful');
  assertEquals(result.validatedParams, ['test'], 'Validated params should match input');

  // エラーコードの検証
  const validCode = 'VALID_CODE';
  const invalidCode = '';
  assertEquals(
    validator['validateErrorCode'](validCode),
    true,
    'Valid error code should pass validation',
  );
  assertEquals(
    validator['validateErrorCode'](invalidCode),
    false,
    'Invalid error code should fail validation',
  );

  // エラーカテゴリの検証
  const validCategory = 'VALID_CATEGORY';
  const invalidCategory = '';
  assertEquals(
    validator['validateErrorCategory'](validCategory),
    true,
    'Valid error category should pass validation',
  );
  assertEquals(
    validator['validateErrorCategory'](invalidCategory),
    false,
    'Invalid error category should fail validation',
  );

  // エラー結果の生成
  const errorResult = validator['createErrorResult'](
    'Test error',
    'TEST_ERROR',
    'test_category',
  );
  assertEquals(errorResult.isValid, false, 'Error result should indicate failure');
  assertEquals(errorResult.errorMessage, 'Test error', 'Error message should match');
  assertEquals(errorResult.errorCode, 'TEST_ERROR', 'Error code should match');
  assertEquals(errorResult.errorCategory, 'test_category', 'Error category should match');

  // 成功結果の生成
  const successResult = validator['createSuccessResult'](['test']);
  assertEquals(successResult.isValid, true, 'Success result should indicate success');
  assertEquals(successResult.validatedParams, ['test'], 'Validated params should match');

  // 結果の検証
  assertEquals(validator['isValid'](successResult), true, 'Valid result should pass validation');
  assertEquals(validator['isValid'](errorResult), false, 'Invalid result should fail validation');

  // 検証済みパラメータの取得
  assertEquals(
    validator['getValidatedParams'](successResult),
    ['test'],
    'Should return validated params',
  );
  assertEquals(
    validator['getValidatedParams'](errorResult),
    [],
    'Should return empty array for invalid result',
  );
});
