import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { SecurityErrorValidator } from '../../../src/validator/security_error_validator.ts';
import { ZeroOptionValidator } from '../../../src/validator/options/option_validator.ts';
import { OneOptionValidator } from '../../../src/validator/options/option_validator.ts';
import { ZeroParamsValidator } from "../../src/validator/params/zero_params_validator.ts";
import { OneParamValidator } from "../../src/validator/params/one_param_validator.ts";
import { TwoParamValidator } from '../../../src/validator/two_param_validator.ts';
import { OptionRule } from "../../src/types/option_rule.ts";

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--uv-*'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: [],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
};

Deno.test('test_validator_result_integration', () => {
  // セキュリティエラーバリデーターの結果テスト
  const securityValidator = new SecurityErrorValidator(optionRule);
  const securityResult = securityValidator.validate(['safe;command']);
  assertEquals(
    securityResult.isValid,
    false,
    'Security validation should fail for dangerous command',
  );
  assertEquals(
    securityResult.validatedParams,
    [],
    'Validated params should be empty for security error',
  );
  assertEquals(typeof securityResult.error?.message, 'string', 'Should have error message');
  assertEquals(typeof securityResult.error?.code, 'string', 'Should have error code');
  assertEquals(typeof securityResult.error?.category, 'string', 'Should have error category');

  // オプションバリデーターの結果テスト
  const zeroOptionValidator = new ZeroOptionValidator();
  const optionsResult = zeroOptionValidator.validate(['--help', '--version'], 'zero', optionRule);
  assertEquals(optionsResult.isValid, true, 'Options validation should pass for valid options');
  assertEquals(
    optionsResult.validatedParams,
    ['--help', '--version'],
    'Validated params should match input',
  );

  // ゼロパラメータバリデーターの結果テスト
  const zeroParamsValidator = new ZeroParamsValidator(optionRule);
  const zeroParamsResult = zeroParamsValidator.validate(['--help']);
  assertEquals(
    zeroParamsResult.isValid,
    true,
    'Zero params validation should pass for options only',
  );
  assertEquals(zeroParamsResult.validatedParams, ['--help'], 'Validated params should match input');

  // 1パラメータバリデーターの結果テスト
  const oneParamValidator = new OneParamValidator(optionRule);
  const oneParamResult = oneParamValidator.validate(['init']);
  assertEquals(oneParamResult.isValid, true, 'One param validation should pass for init command');
  assertEquals(oneParamResult.validatedParams, ['init'], 'Validated params should match input');

  // 2パラメータバリデーターの結果テスト
  const twoParamsValidator = new TwoParamValidator(optionRule);
  const twoParamsResult = twoParamsValidator.validate(['to', 'project']);
  assertEquals(
    twoParamsResult.isValid,
    true,
    'Two params validation should pass for valid parameters',
  );
  assertEquals(
    twoParamsResult.validatedParams,
    ['to', 'project'],
    'Validated params should match input',
  );

  // エラーケースの結果テスト
  const invalidOptionsResult = zeroOptionValidator.validate(['--invalid-option'], 'zero', optionRule);
  assertEquals(
    invalidOptionsResult.isValid,
    false,
    'Options validation should fail for invalid option',
  );
  assertEquals(
    invalidOptionsResult.validatedParams,
    [],
    'Validated params should be empty for invalid option',
  );
  assertEquals(typeof invalidOptionsResult.error?.message, 'string', 'Should have error message');
  assertEquals(typeof invalidOptionsResult.error?.code, 'string', 'Should have error code');
  assertEquals(typeof invalidOptionsResult.error?.category, 'string', 'Should have error category');

  // 複合ケースの結果テスト
  const complexResult = twoParamsValidator.validate(['to', 'project']);
  assertEquals(complexResult.isValid, true, 'Complex validation should pass for valid parameters');
  assertEquals(
    complexResult.validatedParams,
    ['to', 'project'],
    'Validated params should match input',
  );
  assertEquals(complexResult.demonstrativeType, 'to', 'Should have correct demonstrative type');
  assertEquals(complexResult.layerType, 'project', 'Should have correct layer type');

  // エラー詳細のテスト
  const errorResult = securityValidator.validate(['dangerous;command']);
  assertEquals(errorResult.isValid, false, 'Validation should fail for dangerous command');
  assertEquals(typeof errorResult.errorDetails, 'object', 'Should have error details');
  assertEquals(
    errorResult.errorDetails?.command,
    'dangerous;command',
    'Error details should include command',
  );
});
