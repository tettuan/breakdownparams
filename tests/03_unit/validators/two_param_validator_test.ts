import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { TwoParamValidator } from '../../../src/validators/two_params_validator.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../../../src/core/errors/constants.ts';
import { TwoParamResult } from '../../../src/core/params/definitions/types.ts';

Deno.test('TwoParamValidator', async (t) => {
  const validator = new TwoParamValidator();

  await t.step('should handle two parameters', () => {
    const result = validator.validate(['to', 'project']);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as TwoParamResult).type, 'two');
    assertEquals((result.data as TwoParamResult).demonstrativeType, 'to');
    assertEquals((result.data as TwoParamResult).layerType, 'project');
  });

  await t.step('should handle two parameters with options', () => {
    const result = validator.validate(['to', 'project', '--from=test.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as TwoParamResult).type, 'two');
    assertEquals((result.data as TwoParamResult).demonstrativeType, 'to');
    assertEquals((result.data as TwoParamResult).layerType, 'project');
    assertEquals((result.data as TwoParamResult).options.fromFile, 'test.json');
  });

  await t.step('should handle two parameters with multiple options', () => {
    const result = validator.validate([
      'to',
      'project',
      '--from=test.json',
      '--destination=output.json',
    ]);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as TwoParamResult).type, 'two');
    assertEquals((result.data as TwoParamResult).demonstrativeType, 'to');
    assertEquals((result.data as TwoParamResult).layerType, 'project');
    assertEquals((result.data as TwoParamResult).options.fromFile, 'test.json');
    assertEquals((result.data as TwoParamResult).options.destinationFile, 'output.json');
  });

  await t.step('should handle two parameters with short options', () => {
    const result = validator.validate(['to', 'project', '-f=test.json', '-o=output.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as TwoParamResult).type, 'two');
    assertEquals((result.data as TwoParamResult).demonstrativeType, 'to');
    assertEquals((result.data as TwoParamResult).layerType, 'project');
    assertEquals((result.data as TwoParamResult).options.fromFile, 'test.json');
    assertEquals((result.data as TwoParamResult).options.destinationFile, 'output.json');
  });

  await t.step('should handle invalid demonstrative type', () => {
    const result = validator.validate(['invalid', 'project']);
    assertExists(result);
    assertEquals(result.success, false);
    assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
    assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
  });

  await t.step('should handle invalid layer type', () => {
    const result = validator.validate(['to', 'invalid']);
    assertExists(result);
    assertEquals(result.success, false);
    assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
    assertEquals(result.error?.category, ERROR_CATEGORIES.VALIDATION);
  });
});
