import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../security_validator.ts';

const logger = new BreakdownLogger("security");

Deno.test('test_security_validator_unit', () => {
  const validator = new SecurityValidator();

  // Normal case test
  const validResult = validator.validate(['safe_param']);
  logger.debug("Valid security result", { data: { isValid: validResult.isValid, validatedParams: validResult.validatedParams } });
  assertEquals(validResult.isValid, true, 'Safe param should be valid');
  assertEquals(validResult.validatedParams, ['safe_param'], 'Should return correct param');

  // Abnormal case test - shell command execution attempt
  const shellCommandResult = validator.validate(['test; rm -rf /']);
  logger.debug("Shell command rejection result", { data: { isValid: shellCommandResult.isValid, errorCode: shellCommandResult.errorCode } });
  assertEquals(shellCommandResult.isValid, false, 'Shell command should be rejected');
  assertEquals(
    shellCommandResult.errorMessage,
    'Security error: Shell command execution or redirection attempt detected',
    'Should return correct error message',
  );
  assertEquals(shellCommandResult.errorCode, 'SECURITY_ERROR', 'Should return correct error code');

  // Abnormal case test - path traversal attempt
  const pathTraversalResult = validator.validate(['../../../etc/passwd']);
  assertEquals(pathTraversalResult.isValid, false, 'Path traversal should be rejected');
  assertEquals(
    pathTraversalResult.errorMessage,
    'Security error: Path traversal attempt detected',
    'Should return correct error message',
  );
  assertEquals(pathTraversalResult.errorCode, 'SECURITY_ERROR', 'Should return correct error code');

  // Security check for short form options
  // Verify that short form options pass
  const shortOptionsResult = validator.validate(['-h', '-v', '-f=input.md']);
  assertEquals(shortOptionsResult.isValid, true, 'Short form options should pass security check');
  assertEquals(
    shortOptionsResult.validatedParams,
    ['-h', '-v', '-f=input.md'],
    'Should return all short options',
  );

  // Security check for custom variable options
  const userVarResult = validator.validate(['--uv-project=myproject', '--uv-version=1.0.0']);
  assertEquals(userVarResult.isValid, true, 'User variables should pass security check');
  assertEquals(
    userVarResult.validatedParams,
    ['--uv-project=myproject', '--uv-version=1.0.0'],
    'Should return all user variables',
  );

  // Combination of short form options and regular parameters
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
