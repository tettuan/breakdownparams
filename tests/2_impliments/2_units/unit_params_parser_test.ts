import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../../src/parser/params_parser.ts';
import { OptionRule } from '../../../src/types/option_rule.ts';
import { OneParamsResult, TwoParamsResult } from '../../../src/types/params_result.ts';

const optionRule: OptionRule = {
  format: '--key=value',
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
  flagOptions: {
    help: true,
    version: true,
  },
};

Deno.test('test_params_parser_unit', () => {
  const parser = new ParamsParser(optionRule);

  /**
   * Test for parsing options only (zero parameters case).
   *
   * Purpose: Validates that the parser correctly identifies and processes
   * commands containing only options without any positional parameters.
   *
   * Background: Users may invoke commands with only flag options like
   * --help or --version without providing any positional arguments.
   * The parser must correctly classify these as 'zero' type results.
   *
   * Intent: This test ensures that option-only commands are properly
   * parsed and categorized, with all flag values correctly captured
   * and no parameters included in the result.
   */
  const optionsOnlyResult = parser.parse(['--help', '--version']);
  console.log('[DEBUG] optionsOnlyResult:', optionsOnlyResult);
  assertEquals(optionsOnlyResult.type, 'zero', 'Options only should be zero type');
  assertEquals(optionsOnlyResult.params, [], 'Params should be empty for options only');
  assertEquals(
    optionsOnlyResult.options,
    { help: true, version: true },
    'Options should match',
  );

  /**
   * Test for parsing single parameter commands.
   *
   * Purpose: Validates parsing of commands with exactly one positional
   * parameter, which represents a directive type.
   *
   * Background: Single parameter commands are used for actions that
   * don't require a target specification, such as 'init' or 'status'.
   * These are classified as 'one' type results.
   *
   * Intent: This test ensures that single parameter commands are
   * correctly parsed with the parameter value assigned to the
   * directiveType field and the result properly typed as 'one'.
   */
  const oneParamResult = parser.parse(['init']) as OneParamsResult;
  console.log('[DEBUG] oneParamResult:', oneParamResult);
  assertEquals(oneParamResult.type, 'one', 'One parameter should be one type');
  assertEquals(oneParamResult.params, ['init'], 'Params should match input');
  assertEquals(oneParamResult.options, {}, 'Options should be empty');
  assertEquals(oneParamResult.directiveType, 'init', 'Directive type should match');

  /**
   * Test for parsing two parameter commands.
   *
   * Purpose: Validates parsing of commands with exactly two positional
   * parameters representing directive type and layer type.
   *
   * Background: Two parameter commands are the primary use case,
   * specifying both an action (directive) and a target (layer).
   * Examples include 'to project' or 'from issue'.
   *
   * Intent: This test ensures that two parameter commands are correctly
   * parsed with parameters assigned to directiveType and layerType
   * fields respectively, and the result properly typed as 'two'.
   */
  const twoParamResult = parser.parse(['to', 'project']) as TwoParamsResult;
  console.log('[DEBUG] twoParamResult:', twoParamResult);
  assertEquals(twoParamResult.type, 'two', 'Two parameters should be two type');
  assertEquals(twoParamResult.params, ['to', 'project'], 'Params should match input');
  assertEquals(twoParamResult.options, {}, 'Options should be empty');
  assertEquals(twoParamResult.directiveType, 'to', 'Directive type should match');
  assertEquals(twoParamResult.layerType, 'project', 'Layer type should match');

  /**
   * Test for parsing two parameter commands with options.
   *
   * Purpose: Validates parsing of commands that combine two positional
   * parameters with key-value options.
   *
   * Background: Real-world usage often combines positional parameters
   * with options to provide additional configuration. For example,
   * 'to project --from=source --destination=target' specifies both
   * the command structure and additional metadata.
   *
   * Intent: This test ensures that the parser correctly handles mixed
   * input, properly separating positional parameters from options while
   * maintaining the correct typing and structure of the result.
   */
  const twoParamWithOptionsResult = parser.parse([
    'to',
    'project',
    '--from=source',
    '--destination=target',
  ]) as TwoParamsResult;
  console.log('[DEBUG] twoParamWithOptionsResult:', twoParamWithOptionsResult);
  assertEquals(
    twoParamWithOptionsResult.type,
    'two',
    'Two parameters with options should be two type',
  );
  assertEquals(twoParamWithOptionsResult.params, ['to', 'project'], 'Params should match input');
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
   * Test for handling invalid arguments.
   *
   * Purpose: Validates that the parser correctly identifies and handles
   * invalid input that doesn't match any expected parameter patterns.
   *
   * Background: Users may provide invalid commands that don't match
   * the expected directive types or layer types. The parser must
   * gracefully handle these cases by returning an error result.
   *
   * Intent: This test ensures that invalid input is properly classified
   * as 'error' type with empty parameters and options, preventing
   * downstream processing of malformed commands.
   */
  const invalidResult = parser.parse(['invalid']);
  console.log('[DEBUG] invalidResult:', invalidResult);
  assertEquals(invalidResult.type, 'error', 'Invalid arguments should be error type');
  assertEquals(invalidResult.params, [], 'Params should be empty for invalid input');
  assertEquals(invalidResult.options, {}, 'Options should be empty for invalid input');
});
