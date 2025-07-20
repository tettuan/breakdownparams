import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { TwoParamsValidator } from '../two_params_validator.ts';

Deno.test('test_two_params_validator_unit', () => {
  const validator = new TwoParamsValidator();

  // 正常系テスト
  const validResult = validator.validate(['to', 'project']);
  assertEquals(validResult.isValid, true, 'Valid params should be accepted');
  assertEquals(validResult.validatedParams, ['to', 'project'], 'Should return correct params');
  assertEquals(validResult.directiveType, 'to', 'Should set directive type');
  assertEquals(validResult.layerType, 'project', 'Should set layer type');

  // 異常系テスト - パラメータ数
  const invalidCountResult = validator.validate(['to']);
  assertEquals(invalidCountResult.isValid, false, 'Single param should be invalid');
  assertEquals(
    invalidCountResult.errorMessage,
    'Expected exactly two parameters',
    'Should return correct error message',
  );
  assertEquals(invalidCountResult.errorCode, 'INVALID_PARAMS', 'Should return correct error code');

  // 異常系テスト - 不正な DirectiveType
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

  // 異常系テスト - 不正な LayerType
  const invalidLayerResult = validator.validate(['to', 'invalid']);
  assertEquals(invalidLayerResult.isValid, false, 'Invalid layer type should be rejected');
  assertEquals(
    invalidLayerResult.errorCode,
    'INVALID_LAYER_TYPE',
    'Should return correct error code',
  );
});
