import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { SecurityErrorValidator } from '../../../src/validator/security_error_validator.ts';
import { OptionRule } from "../../src/types/option_rule.ts";

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

Deno.test('test_security_error_validator_implementation', () => {
  const validator = new SecurityErrorValidator(optionRule);

  // 安全なパラメータのテスト
  const safeArgs = ['test', '--option=value', 'normal-param'];
  const safeResult = validator.validate(safeArgs);
  assertEquals(safeResult.isValid, true, 'Safe parameters should pass validation');
  assertEquals(
    safeResult.validatedParams,
    ['test', 'normal-param'],
    'Validated params should only include positional arguments',
  );

  // 危険な文字を含むパラメータのテスト（基本的なセキュリティチェック）
  const dangerousArgs = [
    'test;rm -rf /',      // コマンド実行
    'test|cat /etc/passwd', // パイプ
    'test>malicious.txt',   // リダイレクト
    'test../etc/passwd',    // パストラバーサル
  ];

  dangerousArgs.forEach((arg) => {
    const result = validator.validate([arg]);
    assertEquals(
      result.isValid,
      false,
      `Parameter with dangerous character should fail validation: ${arg}`,
    );
    assertEquals(
      result.validatedParams,
      [],
      'Validated params should be empty for dangerous input',
    );
  });

  // 複数のパラメータのテスト
  const mixedArgs = ['safe-param', 'dangerous;param', 'another-safe'];
  const mixedResult = validator.validate(mixedArgs);
  assertEquals(
    mixedResult.isValid,
    false,
    'Parameters with any dangerous character should fail validation',
  );
  assertEquals(mixedResult.validatedParams, [], 'Validated params should be empty for mixed input');
});
