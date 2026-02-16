import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { TwoParamsValidator } from '../two_params_validator.ts';

const logger = new BreakdownLogger("param-validator");

Deno.test('test_two_params_validator_unit', () => {
  const validator = new TwoParamsValidator();

  // Normal case test
  const validResult = validator.validate(['to', 'project']);
  logger.debug("Valid two params result", { data: { isValid: validResult.isValid, directiveType: validResult.directiveType, layerType: validResult.layerType } });
  assertEquals(validResult.isValid, true, 'Valid params should be accepted');
  assertEquals(validResult.validatedParams, ['to', 'project'], 'Should return correct params');
  assertEquals(validResult.directiveType, 'to', 'Should set directive type');
  assertEquals(validResult.layerType, 'project', 'Should set layer type');

  // Abnormal case test - parameter count
  const invalidCountResult = validator.validate(['to']);
  logger.debug("Invalid count result", { data: { isValid: invalidCountResult.isValid, errorCode: invalidCountResult.errorCode } });
  assertEquals(invalidCountResult.isValid, false, 'Single param should be invalid');
  assertEquals(
    invalidCountResult.errorMessage,
    'Expected exactly two parameters',
    'Should return correct error message',
  );
  assertEquals(invalidCountResult.errorCode, 'INVALID_PARAMS', 'Should return correct error code');

  // Abnormal case test - invalid DirectiveType
  const invalidDirectiveResult = validator.validate(['invalid', 'project']);
  assertEquals(
    invalidDirectiveResult.isValid,
    false,
    'Invalid directive type should be rejected',
  );
  assertEquals(
    invalidDirectiveResult.errorCode,
    'INVALID_DIRECTIVE_TYPE',
    'Should return correct error code',
  );

  // Abnormal case test - invalid LayerType
  const invalidLayerResult = validator.validate(['to', 'invalid']);
  assertEquals(invalidLayerResult.isValid, false, 'Invalid layer type should be rejected');
  assertEquals(
    invalidLayerResult.errorCode,
    'INVALID_LAYER_TYPE',
    'Should return correct error code',
  );
});
