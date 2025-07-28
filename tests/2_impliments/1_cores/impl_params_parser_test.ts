import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../../src/parser/params_parser.ts';
import { OptionRule } from '../../../src/types/option_rule.ts';
import { ErrorResult, OneParamsResult, TwoParamsResult } from '../../../src/types/params_result.ts';

/**
 * Test suite for ParamsParser implementation
 *
 * Purpose:
 * This test suite validates the core ParamsParser class, which is the central component
 * responsible for parsing command-line arguments into structured parameter results.
 * The parser must correctly identify and categorize different argument patterns.
 *
 * Background:
 * The ParamsParser implements a pattern-based parsing strategy that distinguishes between:
 * - Zero parameters (options only, like --help)
 * - One parameter commands (like 'init')
 * - Two parameter commands (like 'to project')
 * - Error cases (invalid commands or structures)
 *
 * Intent:
 * - Verify correct parsing of all supported parameter patterns
 * - Ensure options are properly extracted and associated with commands
 * - Validate error handling for invalid input patterns
 * - Test the parser's ability to maintain type safety through proper result typing
 *
 * Test Configuration:
 * The optionRule object defines the parsing rules including user variables,
 * error handling strategies, and supported flag options.
 */
const optionRule: OptionRule = {
  format: '--key=value',
  rules: {
    userVariables: ['directive-type', 'layer-type'],
    requiredOptions: [],
    valueTypes: ['string'],
  },
  errorHandling: {
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
  },
  flagOptions: {
    help: true,
    version: true,
  },
};

Deno.test('test_params_parser_implementation', () => {
  const parser = new ParamsParser(optionRule);

  /**
   * Test Case 1: Options-only parsing (Zero parameters)
   *
   * Purpose: Verify that flag options without positional parameters are correctly parsed
   * Expected: Parser returns 'zero' type result with populated options object
   * Intent: Support help and version queries without requiring command parameters
   *
   * Background: Zero-parameter results are crucial for utility operations like
   * displaying help text or version information without executing actual commands
   *
   * @param optionsOnlyArgs - Array containing only flag options (--help, --version)
   * @returns ZeroParamsResult with type='zero', empty params, and populated options
   */
  const optionsOnlyArgs = ['--help', '--version'];
  const optionsOnlyResult = parser.parse(optionsOnlyArgs);
  assertEquals(optionsOnlyResult.type, 'zero', 'Options only should be zero type');
  assertEquals(optionsOnlyResult.params, [], 'Params should be empty for options only');
  assertEquals(
    optionsOnlyResult.options,
    { help: true, version: true },
    'Options should match',
  );

  /**
   * Test Case 2: Single parameter parsing
   *
   * Purpose: Verify correct parsing of single-parameter commands
   * Expected: Parser returns 'one' type result with the command as directiveType
   * Intent: Handle initialization and setup commands that don't require additional context
   *
   * Background: Single-parameter commands like 'init' are self-contained operations
   * that don't need layer specifications or directive relationships
   *
   * @param oneParamArgs - Array containing a single command parameter ('init')
   * @returns OneParamsResult with type='one' and directiveType set to the command
   */
  const oneParamArgs = ['init'];
  const oneParamResult = parser.parse(oneParamArgs) as OneParamsResult;
  assertEquals(oneParamResult.type, 'one', 'One parameter should be one type');
  assertEquals(oneParamResult.params, ['init'], 'Params should match');
  assertEquals(oneParamResult.options, {}, 'Options should be empty');
  assertEquals(oneParamResult.directiveType, 'init', 'Directive type should match');

  /**
   * Test Case 3: Two parameter parsing
   *
   * Purpose: Verify correct parsing of two-parameter commands with directive relationships
   * Expected: Parser returns 'two' type result with directiveType and layerType properly set
   * Intent: Support the core breakdown syntax of 'directive layer' patterns
   *
   * Background: Two-parameter commands form the foundation of the breakdown system,
   * allowing users to express transformations like 'to project' or 'from issue'
   *
   * @param twoParamArgs - Array containing directive type ('to') and layer type ('project')
   * @returns TwoParamsResult with both directiveType and layerType populated
   */
  const twoParamArgs = ['to', 'project'];
  const twoParamResult = parser.parse(twoParamArgs) as TwoParamsResult;
  assertEquals(twoParamResult.type, 'two', 'Two parameters should be two type');
  assertEquals(twoParamResult.params, ['to', 'project'], 'Params should match');
  assertEquals(twoParamResult.options, {}, 'Options should be empty');
  assertEquals(twoParamResult.directiveType, 'to', 'Directive type should match');
  assertEquals(twoParamResult.layerType, 'project', 'Layer type should match');

  /**
   * Test Case 4: Two parameters with options
   *
   * Purpose: Verify that two-parameter commands can accept additional options
   * Expected: Parser correctly extracts both parameters and options into the result
   * Intent: Enable rich command specifications with source/destination file paths
   *
   * Background: Two-parameter commands often need additional context like input/output
   * files. The parser must correctly separate positional parameters from options
   * while maintaining the command structure integrity
   *
   * Note: The comment indicates that 'from' and 'destination' options are specifically
   * allowed for two-parameter commands, suggesting different option rules per command type
   *
   * @param twoParamWithOptionsArgs - Array with parameters and --key=value options
   * @returns TwoParamsResult with parameters and options properly separated
   */
  const twoParamWithOptionsArgs = ['to', 'project', '--from=source', '--destination=target'];
  const twoParamWithOptionsResult = parser.parse(twoParamWithOptionsArgs) as TwoParamsResult;
  assertEquals(
    twoParamWithOptionsResult.type,
    'two',
    'Two parameters with options should be two type',
  );
  assertEquals(twoParamWithOptionsResult.params, ['to', 'project'], 'Params should match');
  assertEquals(
    twoParamWithOptionsResult.options,
    { from: 'source', destination: 'target' },
    'Options should match',
  );
  assertEquals(
    twoParamWithOptionsResult.directiveType,
    'to',
    'Directive type should match',
  );
  assertEquals(twoParamWithOptionsResult.layerType, 'project', 'Layer type should match');

  /**
   * Test Case 5: Invalid argument handling
   *
   * Purpose: Verify that unrecognized commands result in proper error responses
   * Expected: Parser returns 'error' type result with appropriate error code
   * Intent: Provide clear error feedback for invalid commands
   *
   * Background: Robust error handling is crucial for user experience. The parser
   * must distinguish between different error types (invalid command vs. wrong structure)
   * to provide actionable error messages
   *
   * @param invalidArgs - Array containing an unrecognized command ('invalid')
   * @returns ErrorResult with type='error' and INVALID_COMMAND error code
   */
  const invalidArgs = ['invalid'];
  const invalidResult = parser.parse(invalidArgs) as ErrorResult;
  assertEquals(invalidResult.type, 'error', 'Invalid arguments should be error type');
  assertEquals(invalidResult.params, [], 'Params should be empty for invalid input');
  assertEquals(invalidResult.options, {}, 'Options should be empty for invalid input');
  assertEquals(invalidResult.error?.code, 'INVALID_COMMAND', 'Error code should match');
});
