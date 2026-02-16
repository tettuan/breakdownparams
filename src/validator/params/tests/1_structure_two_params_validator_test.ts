import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { TwoParamsValidator } from '../two_params_validator.ts';

const logger = new BreakdownLogger("param-validator");

Deno.test('test_two_params_validator_structure', () => {
  const validator = new TwoParamsValidator();
  const result = validator.validate(['to', 'project']);
  logger.debug("Two params validation result", { data: { isValid: result.isValid, directiveType: result.directiveType, layerType: result.layerType } });
  assertEquals(result.isValid, true, 'Two params validator should accept valid params');
  assertEquals(
    result.validatedParams,
    ['to', 'project'],
    'Two params validator should return correct params',
  );
  assertEquals(
    result.directiveType,
    'to',
    'Two params validator should set directive type',
  );
  assertEquals(result.layerType, 'project', 'Two params validator should set layer type');
});
