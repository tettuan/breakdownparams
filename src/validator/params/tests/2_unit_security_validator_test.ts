import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { SecurityValidator } from '../../security_validator.ts';

Deno.test('test_security_validator_unit', () => {
  const validator = new SecurityValidator();

  // 正常系テスト
  const validResult = validator.validate(['safe_param']);
  assertEquals(validResult.isValid, true, 'Safe param should be valid');
  assertEquals(validResult.validatedParams, ['safe_param'], 'Should return correct param');

  // 異常系テスト - シェルコマンド実行の試み
  const shellCommandResult = validator.validate(['test; rm -rf /']);
  assertEquals(shellCommandResult.isValid, false, 'Shell command should be rejected');
  assertEquals(shellCommandResult.errorMessage, 'Security error: Shell command execution or redirection attempt detected', 'Should return correct error message');
  assertEquals(shellCommandResult.errorCode, 'SECURITY_ERROR', 'Should return correct error code');

  // 異常系テスト - パストラバーサルの試み
  const pathTraversalResult = validator.validate(['../../../etc/passwd']);
  assertEquals(pathTraversalResult.isValid, false, 'Path traversal should be rejected');
  assertEquals(pathTraversalResult.errorMessage, 'Security error: Path traversal attempt detected', 'Should return correct error message');
  assertEquals(pathTraversalResult.errorCode, 'SECURITY_ERROR', 'Should return correct error code');
}); 