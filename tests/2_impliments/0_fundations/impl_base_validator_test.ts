import { assertEquals } from 'jsr:@std/assert@1';
import { SecurityValidator } from '../../../src/validator/security_validator.ts';

Deno.test('test_security_validator_implementation', () => {
  const validator = new SecurityValidator();

  // 正常系のバリデーション
  const result = validator.validate(['test']);
  assertEquals(result.isValid, true, 'Normal validation should succeed');
  assertEquals(result.validatedParams, ['test'], 'Validated params should match input');
  assertEquals(result.errorMessage, undefined, 'Should have no error message');

  // シェルコマンド実行の試み
  const shellCommandResult = validator.validate(['test; ls']);
  assertEquals(shellCommandResult.isValid, false, 'Shell command attempt should fail');
  assertEquals(shellCommandResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(shellCommandResult.errorCategory, 'security', 'Should have security category');
  assertEquals(
    shellCommandResult.errorMessage,
    'Security error: Shell command execution or redirection attempt detected',
    'Should have correct error message',
  );

  // パストラバーサルの試み
  const pathTraversalResult = validator.validate(['test', '../file']);
  assertEquals(pathTraversalResult.isValid, false, 'Path traversal attempt should fail');
  assertEquals(pathTraversalResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(pathTraversalResult.errorCategory, 'security', 'Should have security category');
  assertEquals(
    pathTraversalResult.errorMessage,
    'Security error: Path traversal attempt detected',
    'Should have correct error message',
  );

  // 複数のセキュリティチェック
  const multipleChecksResult = validator.validate(['test; ls', '../file']);
  assertEquals(multipleChecksResult.isValid, false, 'Multiple security violations should fail');
  assertEquals(multipleChecksResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(multipleChecksResult.errorCategory, 'security', 'Should have security category');
});
