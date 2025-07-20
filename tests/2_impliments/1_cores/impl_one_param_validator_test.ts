import { assertEquals } from 'jsr:@std/assert@1';
import { OneParamValidator } from '../../../src/validator/params/one_param_validator.ts';

/**
 * Test suite for OneParamValidator implementation
 *
 * Purpose:
 * This test suite validates the behavior of the OneParamValidator class, which is responsible
 * for validating single-parameter commands in the breakdown parameter system. These commands
 * typically represent initialization or setup operations that don't require additional context.
 *
 * Background:
 * In the breakdown parameter architecture, commands can have different parameter counts.
 * Single-parameter commands (like 'init') are special cases that trigger specific workflows
 * without requiring directive types or layer specifications. This validator ensures
 * that only valid single-parameter commands are accepted.
 *
 * Intent:
 * - Verify that valid single-parameter commands (e.g., 'init') pass validation
 * - Ensure invalid commands are properly rejected with appropriate error tracking
 * - Validate edge cases like empty arguments and multiple arguments
 * - Maintain consistency with the overall parameter validation architecture
 *
 * Test Coverage:
 * 1. Valid single parameter validation
 * 2. Invalid parameter rejection
 * 3. Empty argument handling
 * 4. Multiple argument rejection (ensuring single-parameter constraint)
 */
Deno.test('test_one_param_validator_implementation', () => {
  const validator = new OneParamValidator();

  /**
   * Test Case 1: Valid single parameter validation
   *
   * Purpose: Verify that recognized single-parameter commands are accepted
   * Expected: The validator should return isValid=true for 'init' command
   * Intent: Ensure the validator correctly identifies and approves valid commands
   *
   * @param validArgs - Array containing a single valid command ('init')
   * @returns Validation result with isValid=true and matching validatedParams
   */
  const validArgs = ['init'];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, 'Valid parameter should pass validation');
  assertEquals(validResult.validatedParams, validArgs, 'Validated params should match input');

  /**
   * Test Case 2: Invalid parameter rejection
   *
   * Purpose: Verify that unrecognized commands are properly rejected
   * Expected: The validator should return isValid=false for unknown commands
   * Intent: Prevent execution of undefined commands and maintain system integrity
   *
   * Note: The validator preserves invalid input in validatedParams for error tracking
   * and debugging purposes, allowing upstream handlers to provide meaningful error messages
   *
   * @param invalidArgs - Array containing an unrecognized command ('invalid')
   * @returns Validation result with isValid=false but preserved validatedParams
   */
  const invalidArgs = ['invalid'];
  const invalidResult = validator.validate(invalidArgs);
  assertEquals(invalidResult.isValid, false, 'Invalid parameter should fail validation');
  assertEquals(
    invalidResult.validatedParams,
    invalidArgs,
    'Validated params should contain the invalid input for tracking',
  );

  /**
   * Test Case 3: Empty argument validation
   *
   * Purpose: Verify that empty argument arrays are rejected
   * Expected: The validator should return isValid=false for empty input
   * Intent: Ensure that the validator requires at least one parameter
   *
   * Background: OneParamValidator specifically handles single-parameter commands,
   * so the absence of any parameters is an invalid state that must be caught
   *
   * @param emptyArgs - Empty string array representing no command-line arguments
   * @returns Validation result with isValid=false and empty validatedParams
   */
  const emptyArgs: string[] = [];
  const emptyResult = validator.validate(emptyArgs);
  assertEquals(emptyResult.isValid, false, 'Empty arguments should fail validation');
  assertEquals(
    emptyResult.validatedParams,
    emptyArgs,
    'Validated params should contain the empty input for tracking',
  );

  /**
   * Test Case 4: Multiple argument rejection
   *
   * Purpose: Verify that multiple arguments are rejected by the single-parameter validator
   * Expected: The validator should return isValid=false when more than one parameter is provided
   * Intent: Enforce the single-parameter constraint strictly
   *
   * Background: This test ensures that commands requiring multiple parameters
   * (like 'init to') are not accidentally processed by the OneParamValidator,
   * maintaining clear separation of concerns between different validator types
   *
   * @param multipleArgs - Array containing multiple parameters that violate the single-parameter rule
   * @returns Validation result with isValid=false but preserved params for error tracking
   */
  const multipleArgs = ['init', 'to'];
  const multipleResult = validator.validate(multipleArgs);
  assertEquals(multipleResult.isValid, false, 'Multiple arguments should fail validation');
  assertEquals(
    multipleResult.validatedParams,
    multipleArgs,
    'Validated params should contain the multiple args for tracking',
  );
});
