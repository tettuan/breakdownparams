import { assertEquals } from 'jsr:@std/assert@1';
import { SecurityValidator } from '../../../src/validator/security_validator.ts';

Deno.test('test_security_error_validator_implementation', () => {
  const validator = new SecurityValidator();

  // 安全なパラメータのテスト
  const safeArgs = ['test', '--option=value', 'normal-param'];
  const safeResult = validator.validate(safeArgs);
  assertEquals(safeResult.isValid, true, 'Safe parameters should pass validation');
  assertEquals(
    safeResult.validatedParams,
    ['test', '--option=value', 'normal-param'],
    'Validated params should include all parameters when validation passes',
  );

  // 危険な文字を含むパラメータのテスト（基本的なセキュリティチェック）
  const dangerousArgs = [
    'test;rm -rf /', // コマンド実行
    'test|cat /etc/passwd', // パイプ
    'test>malicious.txt', // リダイレクト
    'test../etc/passwd', // パストラバーサル
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
      [arg],
      'Validated params should contain the dangerous input for tracking',
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
  assertEquals(
    mixedResult.validatedParams,
    mixedArgs,
    'Validated params should contain all mixed input for tracking',
  );
});
