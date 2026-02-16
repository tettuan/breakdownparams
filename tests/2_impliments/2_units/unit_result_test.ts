import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import type { OptionRule } from '../../../src/types/option_rule.ts';
import type {
  ErrorInfo,
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../../../src/types/params_result.ts';
import type { ValidationResult } from '../../../src/types/validation_result.ts';

const logger = new BreakdownLogger('result');

Deno.test('test_result_unit', () => {
  /**
   * Test for base ParamsResult interface structure.
   *
   * Purpose: Validates the fundamental structure of ParamsResult objects
   * which serve as the base interface for all parsing results.
   *
   * Background: ParamsResult is the base interface that all specific result
   * types (ZeroParamsResult, OneParamsResult, TwoParamsResult) extend from.
   * It defines the common properties that all results must have.
   *
   * Intent: This test ensures that the base result structure contains the
   * essential properties (type, params, options) with correct types. This
   * forms the foundation for type safety across all parsing operations.
   */
  const paramsResult: ParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(typeof paramsResult.type, 'string', 'type should be a string');
  assert(Array.isArray(paramsResult.params), 'params should be an array');
  assertEquals(typeof paramsResult.options, 'object', 'options should be an object');

  /**
   * Test for ZeroParamsResult type structure.
   *
   * Purpose: Validates the structure of results when no positional
   * parameters are provided, only options.
   *
   * Background: ZeroParamsResult represents commands that contain only
   * flag options (like --help, --version) without any positional arguments.
   * This is a common pattern for utility commands.
   *
   * Intent: This test ensures that ZeroParamsResult objects are correctly
   * typed with 'zero' as the type discriminator, empty params array, and
   * an options object to hold any flag values.
   */
  const zeroParamsResult: ZeroParamsResult = {
    type: 'zero',
    params: [],
    options: {},
  };
  assertEquals(zeroParamsResult.type, 'zero', 'type should be zero');
  assert(Array.isArray(zeroParamsResult.params), 'params should be an array');
  assertEquals(typeof zeroParamsResult.options, 'object', 'options should be an object');

  /**
   * Test for OneParamsResult type structure.
   *
   * Purpose: Validates the structure of results for single parameter commands
   * with the additional directiveType field.
   *
   * Background: OneParamsResult represents commands with exactly one positional
   * parameter, such as 'init' or 'status'. The parameter value is stored both
   * in the params array and the directiveType field for convenience.
   *
   * Intent: This test ensures that OneParamsResult objects contain all required
   * fields including the type discriminator 'one', the params array with one
   * element, options object, and the directiveType string field.
   */
  const oneParamResult: OneParamsResult = {
    type: 'one',
    params: ['init'],
    options: {},
    directiveType: 'init',
  };
  assertEquals(oneParamResult.type, 'one', 'type should be one');
  assert(Array.isArray(oneParamResult.params), 'params should be an array');
  assertEquals(typeof oneParamResult.options, 'object', 'options should be an object');
  assertEquals(
    typeof oneParamResult.directiveType,
    'string',
    'directiveType should be a string',
  );

  /**
   * Test for TwoParamsResult type structure.
   *
   * Purpose: Validates the structure of results for two parameter commands
   * with both directiveType and layerType fields.
   *
   * Background: TwoParamsResult represents the primary use case with two
   * positional parameters specifying an action and target (e.g., 'to project').
   * The parameters are stored in the params array and also in named fields
   * for better type safety and developer experience.
   *
   * Intent: This test ensures that TwoParamsResult objects contain all required
   * fields including the type discriminator 'two', params array with two
   * elements, options object, and both directiveType and layerType fields.
   */
  const twoParamsResult: TwoParamsResult = {
    type: 'two',
    params: ['to', 'project'],
    options: {},
    directiveType: 'to',
    layerType: 'project',
  };
  assertEquals(twoParamsResult.type, 'two', 'type should be two');
  assert(Array.isArray(twoParamsResult.params), 'params should be an array');
  assertEquals(typeof twoParamsResult.options, 'object', 'options should be an object');
  assertEquals(
    typeof twoParamsResult.directiveType,
    'string',
    'directiveType should be a string',
  );
  assertEquals(typeof twoParamsResult.layerType, 'string', 'layerType should be a string');
  logger.debug('Result type structures validated', {
    data: {
      zeroType: zeroParamsResult.type,
      oneType: oneParamResult.type,
      twoType: twoParamsResult.type,
    },
  });

  /**
   * Test for ErrorInfo interface structure.
   *
   * Purpose: Validates the structure of error information objects used
   * throughout the application for consistent error reporting.
   *
   * Background: ErrorInfo provides a standardized way to represent errors
   * with message, code, and category fields. This enables structured error
   * handling and better debugging capabilities.
   *
   * Intent: This test ensures that ErrorInfo objects contain all three
   * required string fields (message, code, category) for comprehensive
   * error reporting and categorization.
   */
  const errorInfo: ErrorInfo = {
    message: 'Test error',
    code: 'TEST_ERROR',
    category: 'test_category',
  };
  assertEquals(typeof errorInfo.message, 'string', 'message should be a string');
  assertEquals(typeof errorInfo.code, 'string', 'code should be a string');
  assertEquals(typeof errorInfo.category, 'string', 'category should be a string');

  /**
   * Test for ValidationResult interface structure.
   *
   * Purpose: Validates the structure of validation result objects returned
   * by various validators in the parsing pipeline.
   *
   * Background: ValidationResult provides a consistent interface for validators
   * to return success/failure status along with validated parameters and
   * optional error information. This enables a unified validation flow.
   *
   * Intent: This test ensures that ValidationResult objects contain the
   * required isValid boolean and validatedParams array, supporting both
   * successful validation flows and error reporting scenarios.
   */
  const validationResult: ValidationResult = {
    isValid: true,
    validatedParams: ['test'],
  };
  assertEquals(typeof validationResult.isValid, 'boolean', 'isValid should be a boolean');
  assert(
    Array.isArray(validationResult.validatedParams),
    'validatedParams should be an array',
  );

  /**
   * Test for OptionRule configuration structure.
   *
   * Purpose: Validates the complete structure of OptionRule objects that
   * define how command-line options should be parsed and validated.
   *
   * Background: OptionRule encapsulates all configuration for option parsing
   * including format specifications, validation rules, error handling policies,
   * and flag definitions. This configuration drives the entire option parsing
   * behavior.
   *
   * Intent: This test ensures that OptionRule objects maintain the expected
   * structure with all required properties correctly typed, preventing
   * configuration errors that could lead to parsing failures.
   */
  const optionRule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      userVariables: ['--directive-type', '--layer-type'],
      requiredOptions: [],
      valueTypes: ['string'],
    },
    errorHandling: {
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
    },
  };
  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assert(
    Array.isArray(optionRule.rules.userVariables),
    'userVariables should be an array',
  );
  assertEquals(
    typeof optionRule.errorHandling.emptyValue,
    'string',
    'emptyValue should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assert(
    Array.isArray(optionRule.rules.requiredOptions),
    'requiredOptions should be an array',
  );
  assert(
    Array.isArray(optionRule.rules.valueTypes),
    'valueTypes should be an array',
  );
  assertEquals(typeof optionRule.flagOptions, 'object', 'flagOptions should be an object');
});

Deno.test('test_validation_result', () => {
  /**
   * Test for successful validation result structure.
   *
   * Purpose: Validates the structure of ValidationResult objects when
   * validation succeeds without errors.
   *
   * Background: Successful validation results should have isValid set to true,
   * contain validated parameters, and have undefined error fields. This
   * represents the happy path in the validation pipeline.
   *
   * Intent: This test ensures that successful validation results are properly
   * structured with isValid=true, populated validatedParams, and all error
   * fields (errorMessage, errorCode, errorCategory) undefined.
   */
  const successResult: ValidationResult = {
    isValid: true,
    validatedParams: ['test'],
  };
  assert(successResult.isValid, 'Success result should be valid');
  assertEquals(successResult.validatedParams, ['test'], 'Validated params should match');
  assertEquals(successResult.errorMessage, undefined, 'Error message should be undefined');
  assertEquals(successResult.errorCode, undefined, 'Error code should be undefined');
  assertEquals(successResult.errorCategory, undefined, 'Error category should be undefined');

  /**
   * Test for error validation result structure.
   *
   * Purpose: Validates the structure of ValidationResult objects when
   * validation fails with error information.
   *
   * Background: Failed validation results should have isValid set to false,
   * empty validatedParams, and populated error fields. This enables proper
   * error handling and reporting throughout the application.
   *
   * Intent: This test ensures that error validation results are properly
   * structured with isValid=false, empty validatedParams array, and all
   * error fields (errorMessage, errorCode, errorCategory) populated with
   * appropriate error information.
   */
  const errorResult: ValidationResult = {
    isValid: false,
    validatedParams: [],
    errorMessage: 'Test error',
    errorCode: 'TEST_ERROR',
    errorCategory: 'test_category',
  };
  assertFalse(errorResult.isValid, 'Error result should be invalid');
  assertEquals(errorResult.validatedParams, [], 'Validated params should be empty');
  assertEquals(errorResult.errorMessage, 'Test error', 'Error message should match');
  assertEquals(errorResult.errorCode, 'TEST_ERROR', 'Error code should match');
  assertEquals(errorResult.errorCategory, 'test_category', 'Error category should match');

  /**
   * Test for OptionRule structure in validation context.
   *
   * Purpose: Validates OptionRule structure within the validation test suite
   * to ensure consistency across different test scenarios.
   *
   * Background: OptionRule configuration is used throughout the validation
   * pipeline and must maintain consistent structure. This duplicate test
   * ensures the configuration works correctly in validation contexts.
   *
   * Intent: This test provides additional validation of OptionRule structure
   * specifically within the validation result testing context, ensuring
   * configuration consistency across different parts of the test suite.
   */
  const optionRule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      userVariables: ['--directive-type', '--layer-type'],
      requiredOptions: [],
      valueTypes: ['string'],
    },
    errorHandling: {
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
    },
  };

  assertEquals(typeof optionRule.format, 'string', 'format should be a string');
  assert(
    Array.isArray(optionRule.rules.userVariables),
    'userVariables should be an array',
  );
  assertEquals(
    typeof optionRule.errorHandling.emptyValue,
    'string',
    'emptyValue should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.unknownOption,
    'string',
    'unknownOption should be a string',
  );
  assertEquals(
    typeof optionRule.errorHandling.duplicateOption,
    'string',
    'duplicateOption should be a string',
  );
  assert(
    Array.isArray(optionRule.rules.requiredOptions),
    'requiredOptions should be an array',
  );
  assert(
    Array.isArray(optionRule.rules.valueTypes),
    'valueTypes should be an array',
  );
  assertEquals(typeof optionRule.flagOptions, 'object', 'flagOptions should be an object');
});
