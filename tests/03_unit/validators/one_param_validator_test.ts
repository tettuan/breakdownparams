import { assertEquals, assertExists } from 'https://deno.land/std/testing/asserts.ts';
import { OneParamValidator } from '../../../src/validators/one_param_validator.ts';
import { OneParamResult } from '../../../src/core/params/definitions/types.ts';
import { ERROR_CODES } from '../../../src/core/errors/constants.ts';

Deno.test('OneParamValidator', async (t) => {
  const validator = new OneParamValidator();

  await t.step('should handle one parameter', () => {
    const result = validator.validate(['init']);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as OneParamResult).type, 'one');
    assertEquals((result.data as OneParamResult).command, 'init');
  });

  await t.step('should handle one parameter with options', () => {
    const result = validator.validate(['init', '--from=test.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as OneParamResult).type, 'one');
    assertEquals((result.data as OneParamResult).command, 'init');
    assertEquals((result.data as OneParamResult).options['fromFile'], 'test.json');
  });

  await t.step('should handle one parameter with multiple options', () => {
    const result = validator.validate(['init', '--from=test.json', '--destination=output.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as OneParamResult).type, 'one');
    assertEquals((result.data as OneParamResult).command, 'init');
    assertEquals((result.data as OneParamResult).options['fromFile'], 'test.json');
    assertEquals((result.data as OneParamResult).options['destinationFile'], 'output.json');
  });

  await t.step('should handle one parameter with short options', () => {
    const result = validator.validate(['init', '-f', 'test.json', '-o', 'output.json']);
    assertExists(result);
    assertEquals(result.success, true);
    assertEquals((result.data as OneParamResult).type, 'one');
    assertEquals((result.data as OneParamResult).command, 'init');
    assertEquals((result.data as OneParamResult).options['fromFile'], 'test.json');
    assertEquals((result.data as OneParamResult).options['destinationFile'], 'output.json');
  });

  await t.step('should handle invalid command', () => {
    const result = validator.validate(['invalid']);
    assertExists(result);
    assertEquals(result.success, false);
    assertEquals(result.error?.code, ERROR_CODES.VALIDATION_ERROR);
  });
});
