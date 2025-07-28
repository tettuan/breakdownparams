import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { OneParamValidator } from '../one_param_validator.ts';

Deno.test('test_one_param_validator_unit', () => {
  const validator = new OneParamValidator();

  // Normal case test
  const validResult = validator.validate(['init']);
  assertEquals(validResult.isValid, true, 'init param should be valid');
  assertEquals(validResult.validatedParams, ['init'], 'Should return correct param');
  assertEquals(validResult.directiveType, 'init', 'Should set directive type');

  // Abnormal case test
  const invalidResult = validator.validate(['invalid']);
  assertEquals(invalidResult.isValid, false, 'Non-init param should be invalid');
  assertEquals(
    invalidResult.errorMessage,
    'Invalid command: invalid. Only "init" is allowed',
    'Should return correct error message',
  );
  assertEquals(invalidResult.errorCode, 'INVALID_COMMAND', 'Should return correct error code');
});
