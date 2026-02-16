import { assertEquals } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../../../src/validator/security_validator.ts';

const logger = new BreakdownLogger('param-validator');

Deno.test('test_security_validator_implementation', () => {
  const validator = new SecurityValidator();

  /**
   * Test: Normal validation (happy path)
   *
   * Purpose:
   * Validates that clean, safe parameters pass security validation without errors.
   *
   * Background:
   * Most command-line arguments are legitimate and should pass validation. This
   * test ensures the validator doesn't produce false positives for normal usage.
   *
   * Intent:
   * - Verify normal parameters pass validation
   * - Ensure validated params match the input
   * - Confirm no error message is generated for valid input
   */
  const result = validator.validate(['test']);
  logger.debug('Normal validation result', { data: { isValid: result.isValid, params: ['test'] } });
  assertEquals(result.isValid, true, 'Normal validation should succeed');
  assertEquals(result.validatedParams, ['test'], 'Validated params should match input');
  assertEquals(result.errorMessage, undefined, 'Should have no error message');

  /**
   * Test: Shell command execution attempt detection
   *
   * Purpose:
   * Validates that attempts to execute shell commands through command chaining
   * are properly detected and blocked.
   *
   * Background:
   * Semicolons can be used to chain multiple commands in shell environments.
   * This is a common attack vector for command injection vulnerabilities.
   *
   * Intent:
   * - Test detection of semicolon command separator
   * - Verify proper error code (SECURITY_ERROR) is returned
   * - Ensure error category is 'security'
   * - Validate specific error message for shell command attempts
   */
  const shellCommandResult = validator.validate(['test; ls']);
  assertEquals(shellCommandResult.isValid, false, 'Shell command attempt should fail');
  assertEquals(shellCommandResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(shellCommandResult.errorCategory, 'security', 'Should have security category');
  assertEquals(
    shellCommandResult.errorMessage,
    'Security error: Shell command execution or redirection attempt detected',
    'Should have correct error message',
  );

  /**
   * Test: Path traversal attempt detection
   *
   * Purpose:
   * Validates that attempts to access parent directories or traverse the
   * filesystem are properly detected and blocked.
   *
   * Background:
   * Path traversal attacks use '../' sequences to escape intended directories
   * and access sensitive files. This is a critical security vulnerability.
   *
   * Intent:
   * - Test detection of '../' path traversal pattern
   * - Verify proper error code and category
   * - Ensure specific error message for path traversal
   * - Validate that any parameter containing '../' is rejected
   */
  const pathTraversalResult = validator.validate(['test', '../file']);
  assertEquals(pathTraversalResult.isValid, false, 'Path traversal attempt should fail');
  assertEquals(pathTraversalResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(pathTraversalResult.errorCategory, 'security', 'Should have security category');
  assertEquals(
    pathTraversalResult.errorMessage,
    'Security error: Path traversal attempt detected',
    'Should have correct error message',
  );

  /**
   * Test: Multiple security violations
   *
   * Purpose:
   * Validates that when multiple security issues are present, the validator
   * still correctly identifies and rejects the input.
   *
   * Background:
   * Attackers may combine multiple techniques in a single command. The validator
   * must detect any and all security issues, not just the first one found.
   *
   * Intent:
   * - Test handling of multiple dangerous patterns
   * - Verify consistent error reporting
   * - Ensure comprehensive security coverage
   */
  const multipleChecksResult = validator.validate(['test; ls', '../file']);
  logger.debug('Multiple security violations result', { data: { isValid: multipleChecksResult.isValid, errorCode: multipleChecksResult.errorCode } });
  assertEquals(multipleChecksResult.isValid, false, 'Multiple security violations should fail');
  assertEquals(multipleChecksResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(multipleChecksResult.errorCategory, 'security', 'Should have security category');
});
