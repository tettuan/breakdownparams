import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../security_validator.ts';
import { BaseValidator } from '../params/base_validator.ts';

const logger = new BreakdownLogger("security");

Deno.test('test_security_validator_architecture', () => {
  const validator = new SecurityValidator();
  logger.debug("SecurityValidator instance check", { data: { isBaseValidator: validator instanceof BaseValidator } });
  assertEquals(validator instanceof BaseValidator, true, 'Should be instance of BaseValidator');
  assertEquals(typeof validator.validate, 'function', 'Should have validate method');
});
