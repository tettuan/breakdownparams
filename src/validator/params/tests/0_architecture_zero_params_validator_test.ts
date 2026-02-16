import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ZeroParamsValidator } from '../zero_params_validator.ts';
import { BaseValidator } from '../base_validator.ts';

const logger = new BreakdownLogger("param-validator");

Deno.test('test_zero_params_validator_architecture', () => {
  const validator = new ZeroParamsValidator();
  logger.debug("ZeroParamsValidator instance check", { data: { isBaseValidator: validator instanceof BaseValidator } });
  assertEquals(validator instanceof BaseValidator, true, 'Should be instance of BaseValidator');
  assertEquals(typeof validator.validate, 'function', 'Should have validate method');
});
