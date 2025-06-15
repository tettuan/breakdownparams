import { assertEquals } from 'jsr:@std/assert@1';
import { ValidationResult } from '../../src/types/validation_result.ts';

Deno.test('test_validation_result_structure', () => {
  const successResult: ValidationResult = {
    isValid: true,
    validatedParams: ['param1', 'param2'],
    demonstrativeType: 'type1',
    layerType: 'layer1',
    options: {
      '--key1': 'value1',
      '--key2': 'value2',
    },
  };

  const errorResult: ValidationResult = {
    isValid: false,
    validatedParams: [],
    errorMessage: 'Validation error',
    errorCode: 'INVALID_PARAM',
    errorCategory: 'validation',
    errors: ['error'],
  };

  /**
   * Test: Success case validation result structure
   *
   * Purpose:
   * Validates the structure of ValidationResult when validation succeeds,
   * ensuring all success-related fields are properly typed.
   *
   * Background:
   * Successful validation results contain validated parameters and extracted
   * metadata (demonstrativeType, layerType, options) without error fields.
   *
   * Intent:
   * - Verify isValid is true for success cases
   * - Ensure validatedParams is an array
   * - Validate optional metadata fields are strings when present
   * - Confirm options is an object when provided
   */
  assertEquals(successResult.isValid, true, 'isValid should be true');
  assertEquals(
    Array.isArray(successResult.validatedParams),
    true,
    'validatedParams should be an array',
  );
  assertEquals(
    typeof successResult.demonstrativeType,
    'string',
    'demonstrativeType should be a string',
  );
  assertEquals(typeof successResult.layerType, 'string', 'layerType should be a string');
  assertEquals(typeof successResult.options, 'object', 'options should be an object');

  /**
   * Test: Error case validation result structure
   *
   * Purpose:
   * Validates the structure of ValidationResult when validation fails,
   * ensuring all error-related fields are properly typed.
   *
   * Background:
   * Failed validation results should have isValid=false, empty validatedParams,
   * and populated error information fields for proper error handling.
   *
   * Intent:
   * - Verify isValid is false for error cases
   * - Ensure validatedParams is still an array (but empty)
   * - Validate all error fields (message, code, category) are strings
   * - Confirm errors array is properly structured
   */
  assertEquals(errorResult.isValid, false, 'isValid should be false');
  assertEquals(
    Array.isArray(errorResult.validatedParams),
    true,
    'validatedParams should be an array',
  );
  assertEquals(typeof errorResult.errorMessage, 'string', 'errorMessage should be a string');
  assertEquals(typeof errorResult.errorCode, 'string', 'errorCode should be a string');
  assertEquals(typeof errorResult.errorCategory, 'string', 'errorCategory should be a string');
  assertEquals(typeof errorResult.errors, 'object', 'errors should be an object');
  assertEquals(Array.isArray(errorResult.errors), true, 'errors should be an array');
});
