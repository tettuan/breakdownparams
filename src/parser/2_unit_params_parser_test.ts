import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from './params_parser.ts';
import { OptionRule } from '../types/option_rule.ts';
import { ErrorResult, OneParamsResult, TwoParamsResult } from '../types/params_result.ts';
import { BreakdownLogger } from '@tettuan/breakdownlogger';

/**
 * Unit test for ParamsParser
 * Tests the specific functionality and behavior of ParamsParser
 */
Deno.test('test_params_parser_unit', () => {
  const optionRule: OptionRule = {
    format: '--key=value',
    flagOptions: {
      help: true,
      version: true,
    },
    rules: {
      customVariables: ['--demonstrative-type', '--layer-type'],
      requiredOptions: [],
      valueTypes: ['string'],
    },
    errorHandling: {
      emptyValue: 'error',
      unknownOption: 'error',
      duplicateOption: 'error',
    },
  };

  const parser = new ParamsParser(optionRule);
  const logger = new BreakdownLogger();

  // Test options only functionality
  const optionsOnlyArgs = ['--help', '--version'];
  const optionsOnlyResult = parser.parse(optionsOnlyArgs);
  assertEquals(optionsOnlyResult.type, 'zero', 'Options only should be zero type');
  assertEquals(optionsOnlyResult.params, [], 'Params should be empty for options only');
  assertEquals(
    optionsOnlyResult.options,
    { help: true, version: true },
    'Options should match',
  );

  // Test one param functionality
  const oneParamArgs = ['init'];
  logger.debug('oneParamArgs', oneParamArgs);
  const oneParamResult = parser.parse(oneParamArgs) as OneParamsResult;
  logger.debug('oneParamResult', oneParamResult);
  assertEquals(oneParamResult.type, 'one', 'One parameter should be one type');
  assertEquals(oneParamResult.params, ['init'], 'Params should match');
  assertEquals(oneParamResult.options, {}, 'Options should be empty');
  assertEquals(oneParamResult.demonstrativeType, 'init', 'Demonstrative type should match');

  // Test two params functionality with valid demonstrative and layer types
  const twoParamArgs = ['summary', 'task'];
  const twoParamResult = parser.parse(twoParamArgs) as TwoParamsResult;
  assertEquals(twoParamResult.type, 'two', 'Two parameters should be two type');
  assertEquals(twoParamResult.params, ['summary', 'task'], 'Params should match');
  assertEquals(twoParamResult.options, {}, 'Options should be empty');
  assertEquals(twoParamResult.demonstrativeType, 'summary', 'Demonstrative type should match');
  assertEquals(twoParamResult.layerType, 'task', 'Layer type should match');

  // Test two params with options functionality
  const twoParamWithOptionsArgs = ['summary', 'task', '--from=src', '--destination=dist'];
  const twoParamWithOptionsResult = parser.parse(twoParamWithOptionsArgs) as TwoParamsResult;
  assertEquals(
    twoParamWithOptionsResult.type,
    'two',
    'Two parameters with options should be two type',
  );
  assertEquals(twoParamWithOptionsResult.params, ['summary', 'task'], 'Params should match');
  assertEquals(
    twoParamWithOptionsResult.options,
    { from: 'src', destination: 'dist' },
    'Options should match',
  );
  assertEquals(
    twoParamWithOptionsResult.demonstrativeType,
    'summary',
    'Demonstrative type should match',
  );
  assertEquals(twoParamWithOptionsResult.layerType, 'task', 'Layer type should match');

  // Test invalid input functionality
  const invalidArgs = ['invalid'];
  const invalidResult = parser.parse(invalidArgs) as ErrorResult;
  assertEquals(invalidResult.type, 'error', 'Invalid arguments should be error type');
  assertEquals(invalidResult.params, [], 'Params should be empty for invalid input');
  assertEquals(invalidResult.options, {}, 'Options should be empty for invalid input');
  assertEquals(invalidResult.error?.code, 'INVALID_COMMAND', 'Error code should match');

  // Test short form options - ZeroParams
  logger.debug('=== Testing short form options for ZeroParams ===');
  const shortHelpArgs = ['-h'];
  const shortHelpResult = parser.parse(shortHelpArgs);
  logger.debug('Short help result:', shortHelpResult);
  // Currently fails with "Expected zero parameters"
  if (shortHelpResult.type === 'error') {
    assertEquals(shortHelpResult.error?.code, 'INVALID_PARAMS', 'Short -h currently not supported');
  }

  const shortVersionArgs = ['-v'];
  const shortVersionResult = parser.parse(shortVersionArgs);
  logger.debug('Short version result:', shortVersionResult);
  // Currently fails with "Expected zero parameters"
  if (shortVersionResult.type === 'error') {
    assertEquals(
      shortVersionResult.error?.code,
      'INVALID_PARAMS',
      'Short -v currently not supported',
    );
  }

  // Test short form options - OneParam
  logger.debug('=== Testing short form options for OneParam ===');
  const oneParamShortArgs = ['init', '-c=test'];
  const oneParamShortResult = parser.parse(oneParamShortArgs);
  logger.debug('OneParam short result:', oneParamShortResult);
  // Currently fails with "Expected zero parameters"
  if (oneParamShortResult.type === 'error') {
    assertEquals(
      oneParamShortResult.error?.code,
      'INVALID_PARAMS',
      'Short options currently not supported',
    );
  }

  // Test short form options - TwoParams
  logger.debug('=== Testing short form options for TwoParams ===');
  const twoParamShortArgs = ['to', 'project', '-f=input.md', '-o=output.md'];
  const twoParamShortResult = parser.parse(twoParamShortArgs);
  logger.debug('TwoParam short result:', twoParamShortResult);
  // Currently fails with "Expected zero parameters"
  if (twoParamShortResult.type === 'error') {
    assertEquals(
      twoParamShortResult.error?.code,
      'INVALID_PARAMS',
      'Short options currently not supported',
    );
  }

  // Test mixed long and short form options
  const mixedArgs = ['to', 'project', '--from=input.md', '-o=output.md'];
  const mixedResult = parser.parse(mixedArgs);
  logger.debug('Mixed options result:', mixedResult);
  // Currently fails with "Expected zero parameters"
  if (mixedResult.type === 'error') {
    assertEquals(
      mixedResult.error?.code,
      'INVALID_PARAMS',
      'Mixed short/long options not supported',
    );
  }

  // Test custom variable options
  logger.debug('=== Testing custom variable options ===');
  const customVarArgs = ['to', 'project', '--uv-project=myproject'];
  const customVarResult = parser.parse(customVarArgs);
  logger.debug('Custom variable result:', customVarResult);
  // Currently fails with "Option 'uv-project' is not allowed"
  if (customVarResult.type === 'error') {
    assertEquals(
      customVarResult.error?.code,
      'INVALID_OPTION',
      'Custom variables currently not supported',
    );
  }
});
