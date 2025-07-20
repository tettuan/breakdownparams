import { assertEquals } from 'jsr:@std/assert@1';
import { TwoParamsValidator } from '../../../src/validator/params/two_params_validator.ts';

/**
 * Test suite for TwoParamsValidator implementation
 *
 * Purpose:
 * This test suite validates the TwoParamsValidator class, which ensures that two-parameter
 * commands follow the correct structure and semantics of the breakdown parameter system.
 * Two-parameter commands represent the core transformation syntax of the system.
 *
 * Background:
 * The breakdown parameter system uses a directive-layer pattern where commands
 * consist of a directive type (e.g., 'to', 'from', 'for') followed by a layer type
 * (e.g., 'project', 'issue', 'task'). This validator ensures both parameters are present
 * and follow the expected patterns.
 *
 * Intent:
 * - Validate that exactly two parameters are provided
 * - Ensure the first parameter is a valid directive type
 * - Verify the second parameter is a recognized layer type
 * - Provide appropriate error codes for different failure scenarios
 *
 * Test Coverage:
 * 1. Valid two-parameter command validation
 * 2. Invalid parameter count handling
 * 3. Error code generation for validation failures
 */
Deno.test('test_two_param_validator_implementation', () => {
  const validator = new TwoParamsValidator();

  /**
   * Test Case 1: Valid two-parameter validation
   *
   * Purpose: Verify that properly structured two-parameter commands pass validation
   * Expected: Validator returns isValid=true for 'to project' pattern
   * Intent: Confirm the validator recognizes valid directive-layer combinations
   *
   * Background: The 'to project' pattern represents a transformation directive,
   * indicating conversion or mapping to project-level representation. This is
   * a fundamental pattern in the breakdown system.
   *
   * @param twoParams - Array containing directive ('to') and layer ('project')
   * @returns Validation result with isValid=true and params matching input
   */
  const twoParams = ['to', 'project'];
  const twoParamsResult = validator.validate(twoParams);
  assertEquals(twoParamsResult.isValid, true, 'Two parameters should be valid');
  assertEquals(twoParamsResult.validatedParams, ['to', 'project'], 'Params should match');

  /**
   * Test Case 2: Invalid parameter validation
   *
   * Purpose: Verify that invalid parameter counts or patterns are rejected
   * Expected: Validator returns isValid=false with appropriate error code
   * Intent: Ensure strict validation of the two-parameter requirement
   *
   * Background: This test uses a single parameter to verify the validator's
   * parameter count validation. The validator should detect insufficient
   * parameters and provide meaningful error feedback.
   *
   * Note: The validator preserves invalid input in validatedParams for error
   * tracking, allowing upstream handlers to provide context-aware error messages
   *
   * @param invalidParams - Array with insufficient parameters (only one)
   * @returns Validation result with isValid=false and INVALID_PARAMS error code
   */
  const invalidParams = ['invalid'];
  const invalidResult = validator.validate(invalidParams);
  assertEquals(invalidResult.isValid, false, 'Invalid parameters should fail validation');
  assertEquals(
    invalidResult.validatedParams,
    invalidParams,
    'Params should contain invalid input for tracking',
  );
  assertEquals(invalidResult.errorCode, 'INVALID_PARAMS', 'Error code should match');
});
