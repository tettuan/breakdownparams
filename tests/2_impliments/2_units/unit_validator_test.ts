import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { BaseValidator } from '../../../src/validator/base_validator.ts';
import { SecurityErrorValidator } from '../../../src/validator/security_error_validator.ts';
import { OptionsValidator } from '../../../src/validator/options_validator.ts';
import { ZeroParamsValidator } from '../../../src/validator/zero_params_validator.ts';
import { OneParamValidator } from '../../../src/validator/one_param_validator.ts';
import { TwoParamValidator } from '../../../src/validator/two_param_validator.ts';
import { OptionRule, ValidationResult } from '../../../src/result/types.ts';

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
  paramSpecificOptions: {
    zero: { allowedOptions: ['help', 'version'], requiredOptions: [] },
    one: { allowedOptions: ['help', 'version'], requiredOptions: [] },
    two: {
      allowedOptions: ['help', 'version', 'config', 'uv-project', 'uv-version', 'uv-environment'],
      requiredOptions: [],
    },
  },
};

Deno.test('test_validator_unit', () => {
  // BaseValidatorのテスト
  class TestValidator extends BaseValidator {
    validate(args: string[]): { isValid: boolean; validatedParams: string[] } {
      return {
        isValid: true,
        validatedParams: args,
      };
    }
  }

  const baseValidator = new TestValidator(optionRule);
  assertEquals(baseValidator instanceof BaseValidator, true, 'Should be instance of BaseValidator');
  assertEquals(typeof baseValidator.validate, 'function', 'Should have validate method');

  // SecurityErrorValidatorのテスト
  const securityValidator = new SecurityErrorValidator(optionRule);
  assertEquals(
    securityValidator instanceof BaseValidator,
    true,
    'Should be instance of BaseValidator',
  );
  assertEquals(typeof securityValidator.validate, 'function', 'Should have validate method');

  // OptionsValidatorのテスト
  const optionsValidator = new OptionsValidator(optionRule);
  assertEquals(
    optionsValidator instanceof BaseValidator,
    true,
    'Should be instance of BaseValidator',
  );
  assertEquals(typeof optionsValidator.validate, 'function', 'Should have validate method');

  // ZeroParamsValidatorのテスト
  const zeroParamsValidator = new ZeroParamsValidator(optionRule);
  assertEquals(
    zeroParamsValidator instanceof BaseValidator,
    true,
    'Should be instance of BaseValidator',
  );
  assertEquals(typeof zeroParamsValidator.validate, 'function', 'Should have validate method');

  // OneParamValidatorのテスト
  const oneParamValidator = new OneParamValidator(optionRule);
  assertEquals(
    oneParamValidator instanceof BaseValidator,
    true,
    'Should be instance of BaseValidator',
  );
  assertEquals(typeof oneParamValidator.validate, 'function', 'Should have validate method');

  // TwoParamValidatorのテスト
  const twoParamValidator = new TwoParamValidator(optionRule);
  assertEquals(
    twoParamValidator instanceof BaseValidator,
    true,
    'Should be instance of BaseValidator',
  );
  assertEquals(typeof twoParamValidator.validate, 'function', 'Should have validate method');

  // 共通メソッドのテスト
  const validator = new TestValidator(optionRule);

  // エラーコードの検証
  assertEquals(
    validator['validateErrorCode']('VALID_CODE'),
    true,
    'Valid error code should pass validation',
  );
  assertEquals(
    validator['validateErrorCode'](''),
    false,
    'Empty error code should fail validation',
  );

  // エラーカテゴリの検証
  assertEquals(
    validator['validateErrorCategory']('VALID_CATEGORY'),
    true,
    'Valid error category should pass validation',
  );
  assertEquals(
    validator['validateErrorCategory'](''),
    false,
    'Empty error category should fail validation',
  );
});

Deno.test('test_validator', () => {
  // テスト用のバリデータークラス
  class TestValidator extends BaseValidator {
    public validate(args: string[]): ValidationResult {
      return this.createSuccessResult(args);
    }

    public testCreateErrorResult(
      message: string,
      code: string,
      category: string,
    ): ValidationResult {
      return this.createErrorResult(message, code, category);
    }

    public testIsValid(result: ValidationResult): boolean {
      return this.isValid(result);
    }

    public testGetValidatedParams(result: ValidationResult): string[] {
      return this.getValidatedParams(result);
    }

    public testValidateErrorCode(code: string): boolean {
      return this.validateErrorCode(code);
    }

    public testValidateErrorCategory(category: string): boolean {
      return this.validateErrorCategory(category);
    }
  }

  // バリデーターのインスタンス化
  const validator = new TestValidator(optionRule);

  // 成功結果のテスト
  const successResult = validator.validate(['test']);
  assertEquals(successResult.isValid, true, 'Success result should be valid');
  assertEquals(successResult.validatedParams, ['test'], 'Validated params should match');
  assertEquals(successResult.error, undefined, 'Error should be undefined');

  // エラー結果のテスト
  const errorResult = validator.testCreateErrorResult('Test error', 'TEST_ERROR', 'test_category');
  assertEquals(errorResult.isValid, false, 'Error result should be invalid');
  assertEquals(errorResult.validatedParams, [], 'Validated params should be empty');
  assertEquals(errorResult.error?.message, 'Test error', 'Error message should match');
  assertEquals(errorResult.error?.code, 'TEST_ERROR', 'Error code should match');
  assertEquals(errorResult.error?.category, 'test_category', 'Error category should match');

  // 結果の検証
  assertEquals(validator.testIsValid(successResult), true, 'Valid result should pass validation');
  assertEquals(validator.testIsValid(errorResult), false, 'Invalid result should fail validation');

  // 検証済みパラメータの取得
  assertEquals(
    validator.testGetValidatedParams(successResult),
    ['test'],
    'Should return validated params',
  );
  assertEquals(
    validator.testGetValidatedParams(errorResult),
    [],
    'Should return empty array for invalid result',
  );

  // エラーコードの検証
  assertEquals(
    validator.testValidateErrorCode('TEST_ERROR'),
    true,
    'Valid error code should pass validation',
  );
  assertEquals(
    validator.testValidateErrorCode(''),
    false,
    'Empty error code should fail validation',
  );

  // エラーカテゴリの検証
  assertEquals(
    validator.testValidateErrorCategory('test_category'),
    true,
    'Valid error category should pass validation',
  );
  assertEquals(
    validator.testValidateErrorCategory(''),
    false,
    'Empty error category should fail validation',
  );

  // オプションルールのテスト
  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assertEquals(
    Array.isArray(optionRule.validation.customVariables),
    true,
    'customVariables should be an array',
  );
  assertEquals(typeof optionRule.validation.emptyValue, 'string', 'emptyValue should be a string');
  assertEquals(
    typeof optionRule.validation.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof optionRule.validation.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assertEquals(
    Array.isArray(optionRule.validation.requiredOptions),
    true,
    'requiredOptions should be an array',
  );
  assertEquals(
    Array.isArray(optionRule.validation.valueTypes),
    true,
    'valueTypes should be an array',
  );
  assertEquals(typeof optionRule.flagOptions, 'object', 'flagOptions should be an object');
});
