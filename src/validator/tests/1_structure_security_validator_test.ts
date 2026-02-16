import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../security_validator.ts';

const logger = new BreakdownLogger('security');

Deno.test('test_security_validator_structure', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['safe_param']);
  logger.debug('Security validation result', {
    data: { isValid: result.isValid, validatedParams: result.validatedParams },
  });
  assert(result.isValid, 'Security validator should accept safe params');
  assertEquals(
    result.validatedParams,
    ['safe_param'],
    'Security validator should return correct params',
  );
});
