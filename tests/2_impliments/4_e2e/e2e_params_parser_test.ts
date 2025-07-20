import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../../src/parser/params_parser.ts';
import { OptionRule } from '../../../src/types/option_rule.ts';
import { OneParamsResult, TwoParamsResult } from '../../../src/types/params_result.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  flagOptions: {
    'help': true,
    'version': true,
  },
  rules: {
    customVariables: ['--uv-*'],
    requiredOptions: [],
    valueTypes: ['string'],
  },
  errorHandling: {
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
  },
};

Deno.test('test_params_parser_e2e', () => {
  const parser = new ParamsParser(optionRule);

  // Test: Help command
  const helpResult = parser.parse(['--help']);
  assertEquals(helpResult.type, 'zero', 'Help command should return zero params result');
  assertEquals(helpResult.params, [], 'Help command should be empty params');
  assertEquals(helpResult.options.help, true, 'Help option should be true');

  // Test: Version command
  const versionResult = parser.parse(['--version']);
  assertEquals(versionResult.type, 'zero', 'Version command should return zero params result');
  assertEquals(versionResult.params, [], 'Version command should be empty params');
  assertEquals(versionResult.options.version, true, 'Version option should be true');

  // Test: Init command
  const initResult = parser.parse(['init']) as OneParamsResult;
  assertEquals(initResult.type, 'one', 'Init command should return one param result');
  assertEquals(initResult.params, ['init'], 'Init command should be included in params');
  assertEquals(Object.keys(initResult.options).length, 0, 'Init command should have no options');
  assertEquals(initResult.directiveType, 'init', 'Directive type should be init');

  // Test: To command
  const toResult = parser.parse(['to', 'project']) as TwoParamsResult;
  assertEquals(toResult.type, 'two', 'To command should return two params result');
  assertEquals(toResult.params, ['to', 'project'], 'To command should be included in params');
  assertEquals(Object.keys(toResult.options).length, 0, 'To command should have no options');
  assertEquals(toResult.directiveType, 'to', 'Directive type should be to');
  assertEquals(toResult.layerType, 'project', 'Layer type should be project');

  // Test: Command with options
  const optionsResult = parser.parse([
    'to',
    'project',
    '--directive-type=test',
    '--layer-type=component',
  ]);
  assertEquals(
    optionsResult.type,
    'error',
    'Command with invalid options should return error result',
  );
  assertEquals(optionsResult.error?.code, 'INVALID_OPTIONS', 'Error should be invalid options');
  assertEquals(
    optionsResult.error?.category,
    'validation',
    'Error category should be validation',
  );

  // Test: Error cases
  const errorResult = parser.parse(['invalid;command']);
  assertEquals(errorResult.type, 'error', 'Invalid command should return error result');
  assertEquals(errorResult.error?.code, 'SECURITY_ERROR', 'Error should be security error');
  assertEquals(
    errorResult.error?.category,
    'security',
    'Error category should be security',
  );

  // Test: Complex cases
  const complexResult = parser.parse([
    'to',
    'project',
    '--help',
    '--version',
    '--directive-type=test',
  ]);
  assertEquals(
    complexResult.type,
    'error',
    'Complex command with invalid option should return error result',
  );
  assertEquals(complexResult.error?.code, 'INVALID_OPTIONS', 'Error should be invalid options');
  assertEquals(
    complexResult.error?.category,
    'validation',
    'Error category should be validation',
  );
});
