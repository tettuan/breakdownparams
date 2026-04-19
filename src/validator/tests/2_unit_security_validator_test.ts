import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import {
  formatSecurityError,
  SECURITY_ERROR_CODE_VALUE,
  SecurityValidator,
} from '../security_validator.ts';

const logger = new BreakdownLogger('security');

/**
 * @purpose Smoke-level Acceptance / Rejection / Diagnosis triplet through
 *   the legacy `validate(args)` entry point.
 *
 * @reason Detailed Phase 1 / Phase 2 / per-category coverage lives in
 *   2_unit_security_validator_phase1_test.ts and
 *   2_unit_security_validator_categories_test.ts. This file keeps a few
 *   high-level invariants only, with messages derived from
 *   {@link formatSecurityError}.
 */

Deno.test('unit: validate accepts a benign param', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['safe_param']);
  logger.debug('Valid security result', {
    data: { isValid: result.isValid, validatedParams: result.validatedParams },
  });
  assert(result.isValid, 'Safe param should be valid');
  assertEquals(result.validatedParams, ['safe_param'], 'Should return correct param');
});

Deno.test('unit: validate rejects shell command injection with diagnostic message', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['test; rm -rf /']);
  logger.debug('Shell command rejection result', {
    data: { isValid: result.isValid, errorCode: result.errorCode },
  });
  assertFalse(result.isValid, 'Shell command should be rejected');
  assertEquals(
    result.errorMessage,
    formatSecurityError('shellInjection', 'positional'),
  );
  assertEquals(result.errorCode, SECURITY_ERROR_CODE_VALUE);
});

Deno.test('unit: validate rejects parent traversal with diagnostic message', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['../../../etc/passwd']);
  assertFalse(result.isValid, 'Path traversal should be rejected');
  assertEquals(
    result.errorMessage,
    formatSecurityError('parentTraversal', 'positional'),
  );
  assertEquals(result.errorCode, SECURITY_ERROR_CODE_VALUE);
});

Deno.test('unit: validate accepts short-form options', () => {
  const validator = new SecurityValidator();
  const args = ['-h', '-v', '-f=input.md'];
  const result = validator.validate(args);
  assert(result.isValid, 'Short form options should pass security check');
  assertEquals(result.validatedParams, args);
});

Deno.test('unit: validate accepts user-variable args', () => {
  const validator = new SecurityValidator();
  const args = ['--uv-project=myproject', '--uv-version=1.0.0'];
  const result = validator.validate(args);
  assert(result.isValid, 'User variables should pass security check');
  assertEquals(result.validatedParams, args);
});

Deno.test('unit: validate accepts mixed positional + short-form options', () => {
  const validator = new SecurityValidator();
  const args = ['to', 'project', '-f=input.md', '-o=output.md'];
  const result = validator.validate(args);
  assert(result.isValid, 'Mixed params and short options should pass');
  assertEquals(result.validatedParams, args);
});
