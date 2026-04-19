import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import {
  formatSecurityError,
  SECURITY_ERROR_CATEGORY_VALUE,
  SECURITY_ERROR_CODE_VALUE,
  SecurityValidator,
} from '../../../src/validator/security_validator.ts';

const logger = new BreakdownLogger('param-validator');

/**
 * @purpose Implementation-level smoke for SecurityValidator's three contracts:
 *   Acceptance / Rejection / Diagnosis. Every expected error message and
 *   error code is derived from the validator's own format helpers so the
 *   test does not duplicate the format string.
 */

Deno.test('impl: SecurityValidator accepts a benign parameter', () => {
  /**
   * @purpose Acceptance: clean input must pass without errors.
   * @intent Guards against false positives in the validator pattern set.
   */
  const validator = new SecurityValidator();
  const result = validator.validate(['test']);
  logger.debug('Normal validation result', { data: { isValid: result.isValid, params: ['test'] } });
  assert(result.isValid, 'Normal validation should succeed');
  assertEquals(result.validatedParams, ['test'], 'Validated params should match input');
  assertEquals(result.errorMessage, undefined, 'Should have no error message');
});

Deno.test('impl: SecurityValidator rejects shell injection with canonical diagnostic', () => {
  /**
   * @purpose Rejection + Diagnosis: shellInjection must surface the
   *   canonical error code, category, and formatted message.
   * @reason Semicolon command chaining is a textbook injection vector.
   */
  const validator = new SecurityValidator();
  const result = validator.validate(['test; ls']);
  assertFalse(result.isValid, 'Shell command attempt should fail');
  assertEquals(result.errorCode, SECURITY_ERROR_CODE_VALUE);
  assertEquals(result.errorCategory, SECURITY_ERROR_CATEGORY_VALUE);
  assertEquals(
    result.errorMessage,
    formatSecurityError('shellInjection', 'positional'),
  );
});

Deno.test('impl: SecurityValidator rejects parent traversal with canonical diagnostic', () => {
  /**
   * @purpose Rejection + Diagnosis for parentTraversal in positional context.
   * @reason `../` sequences escape the intended directory.
   */
  const validator = new SecurityValidator();
  const result = validator.validate(['test', '../file']);
  assertFalse(result.isValid, 'Path traversal attempt should fail');
  assertEquals(result.errorCode, SECURITY_ERROR_CODE_VALUE);
  assertEquals(result.errorCategory, SECURITY_ERROR_CATEGORY_VALUE);
  assertEquals(
    result.errorMessage,
    formatSecurityError('parentTraversal', 'positional'),
  );
});

Deno.test('impl: SecurityValidator surfaces a security error when multiple violations are present', () => {
  /**
   * @purpose Rejection: when several violations co-occur, the validator
   *   must still surface a security-error diagnosis (first-hit wins, but
   *   this test does not pin which category — only that the contract holds).
   */
  const validator = new SecurityValidator();
  const result = validator.validate(['test; ls', '../file']);
  logger.debug('Multiple security violations result', {
    data: { isValid: result.isValid, errorCode: result.errorCode },
  });
  assertFalse(result.isValid, 'Multiple security violations should fail');
  assertEquals(result.errorCode, SECURITY_ERROR_CODE_VALUE);
  assertEquals(result.errorCategory, SECURITY_ERROR_CATEGORY_VALUE);
});
