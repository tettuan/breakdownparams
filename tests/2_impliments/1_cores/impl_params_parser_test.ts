import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../../src/parser/params_parser.ts';
import { OptionRule } from '../../../src/types/option_rule.ts';
import { ErrorResult, OneParamsResult, TwoParamsResult } from '../../../src/types/params_result.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  rules: {
    customVariables: ['demonstrative-type', 'layer-type'],
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

  // オプションのみのテスト
  const optionsOnlyArgs = ['--help', '--version'];
  const optionsOnlyResult = parser.parse(optionsOnlyArgs);
  assertEquals(optionsOnlyResult.type, 'zero', 'Options only should be zero type');
  assertEquals(optionsOnlyResult.params, [], 'Params should be empty for options only');
  assertEquals(
    optionsOnlyResult.options,
    { help: true, version: true },
    'Options should match',
  );

  // 1つの引数のテスト
  const oneParamArgs = ['init'];
  const oneParamResult = parser.parse(oneParamArgs) as OneParamsResult;
  assertEquals(oneParamResult.type, 'one', 'One parameter should be one type');
  assertEquals(oneParamResult.params, ['init'], 'Params should match');
  assertEquals(oneParamResult.options, {}, 'Options should be empty');
  assertEquals(oneParamResult.demonstrativeType, 'init', 'Demonstrative type should match');

  // 2つの引数のテスト
  const twoParamArgs = ['to', 'project'];
  const twoParamResult = parser.parse(twoParamArgs) as TwoParamsResult;
  assertEquals(twoParamResult.type, 'two', 'Two parameters should be two type');
  assertEquals(twoParamResult.params, ['to', 'project'], 'Params should match');
  assertEquals(twoParamResult.options, {}, 'Options should be empty');
  assertEquals(twoParamResult.demonstrativeType, 'to', 'Demonstrative type should match');
  assertEquals(twoParamResult.layerType, 'project', 'Layer type should match');

  // オプション付きの2つの引数のテスト (from/destination are allowed for two params)
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
    twoParamWithOptionsResult.demonstrativeType,
    'to',
    'Demonstrative type should match',
  );
  assertEquals(twoParamWithOptionsResult.layerType, 'project', 'Layer type should match');

  // 無効な引数のテスト
  const invalidArgs = ['invalid'];
  const invalidResult = parser.parse(invalidArgs) as ErrorResult;
  assertEquals(invalidResult.type, 'error', 'Invalid arguments should be error type');
  assertEquals(invalidResult.params, [], 'Params should be empty for invalid input');
  assertEquals(invalidResult.options, {}, 'Options should be empty for invalid input');
  assertEquals(invalidResult.error?.code, 'INVALID_COMMAND', 'Error code should match');
});
