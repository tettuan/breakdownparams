import { assertEquals } from 'jsr:@std/assert@1';
import { ZeroParamsValidator } from '../../../src/validator/params/zero_params_validator.ts';

/**
 * Test suite for ZeroParamsValidator implementation
 *
 * Purpose:
 * This test suite validates the ZeroParamsValidator class, which handles cases where
 * no positional parameters should be present. This validator is crucial for supporting
 * option-only commands like help queries or version checks.
 *
 * Background:
 * In the breakdown parameter system, some operations don't require positional parameters.
 * Examples include:
 * - Display help information (--help)
 * - Show version (--version)
 * - List available commands
 * The ZeroParamsValidator ensures these commands are not mixed with positional arguments.
 *
 * Intent:
 * - Validate that truly empty parameter lists are accepted
 * - Ensure any positional parameters cause validation failure
 * - Verify that option-only arguments don't interfere with validation
 * - Maintain strict separation between positional and optional parameters
 *
 * Test Coverage:
 * 1. Empty parameter validation (success case)
 * 2. Rejection of positional parameters
 * 3. Handling of invalid options
 * 4. Multiple positional argument rejection
 * 5. Mixed argument pattern rejection
 */
Deno.test('test_zero_params_validator_implementation', () => {
  const validator = new ZeroParamsValidator();

  /**
   * Test Case 1: Valid zero-parameter validation
   *
   * Purpose: Verify that empty parameter arrays pass validation
   * Expected: Validator returns isValid=true for empty input
   * Intent: Confirm the validator correctly identifies the absence of parameters
   *
   * Background: This is the primary success case for ZeroParamsValidator,
   * representing commands that operate solely through options or flags
   *
   * @param validArgs - Empty array representing no positional parameters
   * @returns Validation result with isValid=true and empty validatedParams
   */
  const validArgs: string[] = [];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, 'Zero parameters should pass validation');
  assertEquals(validResult.validatedParams, validArgs, 'Validated params should match input');

  /**
   * Test Case 2: Positional parameter rejection
   *
   * Purpose: Verify that any positional parameters cause validation failure
   * Expected: Validator returns isValid=false when parameters are present
   * Intent: Enforce the zero-parameter constraint strictly
   *
   * Background: This test ensures that commands meant for zero parameters
   * don't accidentally accept positional arguments, maintaining clear
   * command semantics and preventing ambiguous interpretations
   *
   * Note: validatedParams is empty rather than preserving input, indicating
   * complete rejection of the parameter pattern
   *
   * @param withParams - Array containing a positional parameter ('init')
   * @returns Validation result with isValid=false and empty validatedParams
   */
  const withParams = ['init'];
  const withParamsResult = validator.validate(withParams);
  assertEquals(withParamsResult.isValid, false, 'Parameters should fail validation');
  assertEquals(
    withParamsResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  /**
   * Test Case 3: Empty argument validation (duplicate test)
   *
   * Purpose: Re-verify empty array handling (appears to be a duplicate of Test Case 1)
   * Expected: Validator returns isValid=true for empty input
   * Intent: Additional confirmation of the primary success case
   *
   * Note: This test appears redundant with Test Case 1, possibly intended
   * to test a different edge case or left from refactoring
   *
   * @param emptyArgs - Empty array (same as Test Case 1)
   * @returns Validation result with isValid=true and empty validatedParams
   */
  const emptyArgs: string[] = [];
  const emptyResult = validator.validate(emptyArgs);
  assertEquals(emptyResult.isValid, true, 'Empty arguments should pass validation');
  assertEquals(emptyResult.validatedParams, [], 'Validated params should be empty for empty input');

  /**
   * Test Case 4: Invalid option handling
   *
   * Purpose: Verify that unrecognized options are rejected
   * Expected: Validator returns isValid=false for invalid option flags
   * Intent: Ensure option validation is performed even for zero-parameter commands
   *
   * Background: While ZeroParamsValidator accepts no positional parameters,
   * it must still validate that any provided options are recognized and valid.
   * This prevents typos and ensures command-line interface consistency.
   *
   * @param invalidOptionArgs - Array containing an unrecognized option flag
   * @returns Validation result with isValid=false and empty validatedParams
   */
  const invalidOptionArgs = ['--invalid-option'];
  const invalidOptionResult = validator.validate(invalidOptionArgs);
  assertEquals(invalidOptionResult.isValid, false, 'Invalid options should fail validation');
  assertEquals(
    invalidOptionResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  /**
   * Test Case 5: Multiple positional argument rejection
   *
   * Purpose: Verify that multiple positional parameters are rejected
   * Expected: Validator returns isValid=false for multiple arguments
   * Intent: Test the validator's behavior with obviously invalid input
   *
   * Background: This test provides multiple positional arguments to ensure
   * the validator doesn't just check for single parameters but properly
   * rejects any non-zero parameter count
   *
   * @param multiplePositionalArgs - Array with multiple positional parameters
   * @returns Validation result with isValid=false and empty validatedParams
   */
  const multiplePositionalArgs = ['init', 'to', 'project'];
  const multiplePositionalResult = validator.validate(multiplePositionalArgs);
  assertEquals(
    multiplePositionalResult.isValid,
    false,
    'Multiple positional arguments should fail validation',
  );
  assertEquals(
    multiplePositionalResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  /**
   * Test Case 6: Mixed argument pattern rejection
   *
   * Purpose: Verify that mixing options and positional parameters fails validation
   * Expected: Validator returns isValid=false for mixed argument patterns
   * Intent: Ensure clean separation between option-only and parameter commands
   *
   * Background: This test represents a common user error where help/version
   * flags are mixed with actual commands. The validator must reject such
   * patterns to maintain clear command semantics and prevent ambiguous
   * interpretations of user intent.
   *
   * @param mixedArgs - Array mixing option flags with positional parameters
   * @returns Validation result with isValid=false and empty validatedParams
   */
  const mixedArgs = ['--help', 'init', '--version'];
  const mixedResult = validator.validate(mixedArgs);
  assertEquals(
    mixedResult.isValid,
    false,
    'Mixed options and positional arguments should fail validation',
  );
  assertEquals(
    mixedResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );
});
