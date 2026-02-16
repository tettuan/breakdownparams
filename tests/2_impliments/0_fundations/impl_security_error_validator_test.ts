import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../../../src/validator/security_validator.ts';

const logger = new BreakdownLogger('security');

Deno.test('test_security_error_validator_implementation', () => {
  const validator = new SecurityValidator();

  /**
   * Test: Safe parameter validation
   *
   * Purpose:
   * Validates that parameters without dangerous characters pass security validation
   * successfully.
   *
   * Background:
   * The security validator should allow normal command-line arguments that don't
   * contain shell metacharacters or path traversal patterns. This is the happy
   * path that most legitimate CLI usage follows.
   *
   * Intent:
   * - Verify safe parameters pass validation (isValid = true)
   * - Ensure all parameters are included in validatedParams
   * - Confirm no false positives in security detection
   */
  const safeArgs = ['test', '--option=value', 'normal-param'];
  const safeResult = validator.validate(safeArgs);
  logger.debug('Safe validation result', {
    data: { isValid: safeResult.isValid, params: safeArgs },
  });
  assert(safeResult.isValid, 'Safe parameters should pass validation');
  assertEquals(
    safeResult.validatedParams,
    ['test', '--option=value', 'normal-param'],
    'Validated params should include all parameters when validation passes',
  );

  /**
   * Test: Parameters with dangerous characters (basic security checks)
   *
   * Purpose:
   * Validates that parameters containing shell metacharacters or dangerous
   * patterns are properly detected and rejected.
   *
   * Background:
   * Command injection is a critical security vulnerability. The validator must
   * detect common attack patterns including command chaining, pipes, redirects,
   * and path traversal attempts to prevent malicious code execution.
   *
   * Intent:
   * - Test detection of command execution attempts (semicolon)
   * - Test detection of pipe characters
   * - Test detection of output redirection
   * - Test detection of path traversal patterns
   * - Ensure dangerous params are still included in validatedParams for logging
   */
  const dangerousArgs = [
    'test;rm -rf /', // Command execution attempt
    'test|cat /etc/passwd', // Pipe to another command
    'test>malicious.txt', // Output redirection
    'test../etc/passwd', // Path traversal attempt
  ];

  dangerousArgs.forEach((arg) => {
    const result = validator.validate([arg]);
    assertFalse(
      result.isValid,
      `Parameter with dangerous character should fail validation: ${arg}`,
    );
    assertEquals(
      result.validatedParams,
      [arg],
      'Validated params should contain the dangerous input for tracking',
    );
  });

  /**
   * Test: Multiple parameters with mixed safety levels
   *
   * Purpose:
   * Validates that when multiple parameters are provided, the presence of
   * any dangerous parameter causes the entire validation to fail.
   *
   * Background:
   * In real-world usage, commands often have multiple arguments. If any single
   * argument contains dangerous characters, the entire command must be rejected
   * to maintain security.
   *
   * Intent:
   * - Test that one dangerous param fails entire validation
   * - Verify all params (safe and dangerous) are in validatedParams
   * - Ensure comprehensive validation across all arguments
   */
  const mixedArgs = ['safe-param', 'dangerous;param', 'another-safe'];
  const mixedResult = validator.validate(mixedArgs);
  logger.debug('Mixed args validation result', {
    data: { isValid: mixedResult.isValid, params: mixedArgs },
  });
  assertFalse(
    mixedResult.isValid,
    'Parameters with any dangerous character should fail validation',
  );
  assertEquals(
    mixedResult.validatedParams,
    mixedArgs,
    'Validated params should contain all mixed input for tracking',
  );
});
