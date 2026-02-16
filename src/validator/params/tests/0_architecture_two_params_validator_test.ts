import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { TwoParamsValidator } from '../two_params_validator.ts';
import { BaseValidator } from '../base_validator.ts';

const logger = new BreakdownLogger('param-validator');

Deno.test('test_two_params_validator_architecture', () => {
  const validator = new TwoParamsValidator();
  logger.debug('TwoParamsValidator instance check', {
    data: { isBaseValidator: validator instanceof BaseValidator },
  });
  assert(validator instanceof BaseValidator, 'Should be instance of BaseValidator');
  assertEquals(typeof validator.validate, 'function', 'Should have validate method');
});
