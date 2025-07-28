import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { SecurityValidator } from '../security_validator.ts';

Deno.test('test_security_validator_unit', () => {
  const validator = new SecurityValidator();

  // 正常系テスト
  const validResult = validator.validate(['safe_param']);
  assertEquals(validResult.isValid, true, 'Safe param should be valid');
  assertEquals(validResult.validatedParams, ['safe_param'], 'Should return correct param');

  // 異常系テスト - シェルコマンド実行の試み
  const shellCommandResult = validator.validate(['test; rm -rf /']);
  assertEquals(shellCommandResult.isValid, false, 'Shell command should be rejected');
  assertEquals(
    shellCommandResult.errorMessage,
    'Security error: Shell command execution or redirection attempt detected',
    'Should return correct error message',
  );
  assertEquals(shellCommandResult.errorCode, 'SECURITY_ERROR', 'Should return correct error code');

  // 異常系テスト - パストラバーサルの試み
  const pathTraversalResult = validator.validate(['../../../etc/passwd']);
  assertEquals(pathTraversalResult.isValid, false, 'Path traversal should be rejected');
  assertEquals(
    pathTraversalResult.errorMessage,
    'Security error: Path traversal attempt detected',
    'Should return correct error message',
  );
  assertEquals(pathTraversalResult.errorCode, 'SECURITY_ERROR', 'Should return correct error code');

  // 短縮形オプションのセキュリティチェック
  // 短縮形オプションが通過するか確認
  const shortOptionsResult = validator.validate(['-h', '-v', '-f=input.md']);
  assertEquals(shortOptionsResult.isValid, true, 'Short form options should pass security check');
  assertEquals(
    shortOptionsResult.validatedParams,
    ['-h', '-v', '-f=input.md'],
    'Should return all short options',
  );

  // カスタム変数オプションのセキュリティチェック
  const userVarResult = validator.validate(['--uv-project=myproject', '--uv-version=1.0.0']);
  assertEquals(userVarResult.isValid, true, 'User variables should pass security check');
  assertEquals(
    userVarResult.validatedParams,
    ['--uv-project=myproject', '--uv-version=1.0.0'],
    'Should return all user variables',
  );

  // 短縮形オプションと通常パラメータの組み合わせ
  const mixedArgsResult = validator.validate(['to', 'project', '-f=input.md', '-o=output.md']);
  assertEquals(
    mixedArgsResult.isValid,
    true,
    'Mixed params and short options should pass security check',
  );
  assertEquals(
    mixedArgsResult.validatedParams,
    ['to', 'project', '-f=input.md', '-o=output.md'],
    'Should return all arguments',
  );
});
