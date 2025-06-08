import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../../../src/parser/params_parser.ts';
import { OneParamResult, OptionRule, TwoParamResult } from "../../src/types/option_rule.ts"';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--uv-*'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: [],
  },
  flagOptions: {
    'help': 'help',
    'version': 'version',
  },
};

Deno.test('test_params_parser_e2e', () => {
  const parser = new ParamsParser(optionRule);

  // ヘルプコマンドのテスト
  const helpResult = parser.parse(['--help']);
  assertEquals(helpResult.type, 'zero', 'Help command should return zero params result');
  assertEquals(helpResult.params, [], 'Help command should be empty params');
  assertEquals(helpResult.options.help, undefined, 'Help option should be present');

  // バージョンコマンドのテスト
  const versionResult = parser.parse(['--version']);
  assertEquals(versionResult.type, 'zero', 'Version command should return zero params result');
  assertEquals(versionResult.params, [], 'Version command should be empty params');
  assertEquals(versionResult.options.version, undefined, 'Version option should be present');

  // initコマンドのテスト
  const initResult = parser.parse(['init']) as OneParamResult;
  assertEquals(initResult.type, 'one', 'Init command should return one param result');
  assertEquals(initResult.params, ['init'], 'Init command should be included in params');
  assertEquals(Object.keys(initResult.options).length, 0, 'Init command should have no options');
  assertEquals(initResult.demonstrativeType, 'init', 'Demonstrative type should be init');

  // toコマンドのテスト
  const toResult = parser.parse(['to', 'project']) as TwoParamResult;
  assertEquals(toResult.type, 'two', 'To command should return two params result');
  assertEquals(toResult.params, ['to', 'project'], 'To command should be included in params');
  assertEquals(Object.keys(toResult.options).length, 0, 'To command should have no options');
  assertEquals(toResult.demonstrativeType, 'to', 'Demonstrative type should be to');
  assertEquals(toResult.layerType, 'project', 'Layer type should be project');

  // オプション付きコマンドのテスト
  const optionsResult = parser.parse([
    'to',
    'project',
    '--demonstrative-type=test',
    '--layer-type=component',
  ]);
  assertEquals(
    optionsResult.type,
    'error',
    'Command with invalid options should return error result',
  );
  assertEquals(optionsResult.error?.code, 'VALIDATION_ERROR', 'Error should be validation error');
  assertEquals(
    optionsResult.error?.category,
    'invalid_format',
    'Error category should be invalid_format',
  );

  // エラーケースのテスト
  const errorResult = parser.parse(['invalid;command']);
  assertEquals(errorResult.type, 'error', 'Invalid command should return error result');
  assertEquals(errorResult.error?.code, 'SECURITY_ERROR', 'Error should be security error');
  assertEquals(
    errorResult.error?.category,
    'invalid_characters',
    'Error category should be invalid_characters',
  );

  // 複合ケースのテスト
  const complexResult = parser.parse([
    'to',
    'project',
    '--help',
    '--version',
    '--demonstrative-type=test',
  ]);
  assertEquals(
    complexResult.type,
    'error',
    'Complex command with invalid option should return error result',
  );
  assertEquals(complexResult.error?.code, 'VALIDATION_ERROR', 'Error should be validation error');
  assertEquals(
    complexResult.error?.category,
    'invalid_format',
    'Error category should be invalid_format',
  );
});
