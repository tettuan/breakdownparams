import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { OneParamValidator } from '../one_param_validator.ts';

const logger = new BreakdownLogger("param-validator");

Deno.test('test_one_param_validator_structure', () => {
  const validator = new OneParamValidator();
  const result = validator.validate(['init']);
  logger.debug("One param validation result", { data: { isValid: result.isValid, directiveType: result.directiveType } });
  assertEquals(result.isValid, true, 'One param validator should accept init param');
  assertEquals(result.validatedParams, ['init'], 'One param validator should return correct param');
  assertEquals(
    result.directiveType,
    'init',
    'One param validator should set directive type',
  );
});
