import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ParamsParser } from '../../../src/parser/params_parser.ts';
import { SecurityValidator } from '../../../src/validator/security_validator.ts';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../../../src/validator/options/option_validator.ts';
import { ZeroParamsValidator } from '../../../src/validator/params/zero_params_validator.ts';
import { OneParamValidator } from '../../../src/validator/params/one_param_validator.ts';
import { TwoParamsValidator } from '../../../src/validator/params/two_params_validator.ts';
import type { OptionRule } from '../../../src/types/option_rule.ts';

const logger = new BreakdownLogger('integration');

const optionRule: OptionRule = {
  format: '--key=value',
  flagOptions: {
    help: true,
    version: true,
  },
  rules: {
    userVariables: ['--uv-*'],
    requiredOptions: [],
    valueTypes: ['string'],
  },
  errorHandling: {
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
  },
};

Deno.test('test_parser_validator_integration', () => {
  const parser = new ParamsParser(optionRule);

  // Create and verify validators
  const paramValidators = [
    new ZeroParamsValidator(),
    new OneParamValidator(),
    new TwoParamsValidator(),
  ];
  const optionValidators = [
    new ZeroOptionValidator(),
    new OneOptionValidator(),
    new TwoOptionValidator(),
  ];
  const securityValidator = new SecurityValidator();
  assertEquals(paramValidators.length, 3, 'Should create 3 param validators');
  assertEquals(optionValidators.length, 3, 'Should create 3 option validators');
  assert(
    securityValidator instanceof SecurityValidator,
    'Should create SecurityValidator',
  );
  assert(
    paramValidators[0] instanceof ZeroParamsValidator,
    'First param validator should be ZeroParamsValidator',
  );
  assert(
    paramValidators[1] instanceof OneParamValidator,
    'Second param validator should be OneParamValidator',
  );
  assert(
    paramValidators[2] instanceof TwoParamsValidator,
    'Third param validator should be TwoParamsValidator',
  );

  // Integration tests for each validator
  // 1. Security error validator
  const securityResult = securityValidator.validate(['safe;command']);
  assertFalse(
    securityResult.isValid,
    'Security validator should reject dangerous commands',
  );

  // 2. Option validator
  const optionsResult = optionValidators[0].validate(['--help', '--version'], 'zero', optionRule);
  assert(optionsResult.isValid, 'Options validator should accept valid options');

  // 3. Zero parameter validator
  const zeroParamsResult = paramValidators[0].validate([]);
  assert(zeroParamsResult.isValid, 'Zero params validator should accept empty params');

  // 4. One parameter validator
  const oneParamResult = paramValidators[1].validate(['init']);
  assert(oneParamResult.isValid, 'One param validator should accept init command');

  // 5. Two parameter validator
  const twoParamsResult = paramValidators[2].validate(['to', 'project']);
  assert(
    twoParamsResult.isValid,
    'Two params validator should accept valid parameters',
  );

  logger.debug('Validator integration setup', {
    data: {
      paramValidatorCount: paramValidators.length,
      optionValidatorCount: optionValidators.length,
    },
  });

  // Parser and validator integration tests
  // 1. Zero parameter case
  const zeroParamsParseResult = parser.parse(['--help']);
  assertEquals(zeroParamsParseResult.type, 'zero', 'Should parse as zero params');
  assertEquals(zeroParamsParseResult.params, [], 'Should have empty params');
  assert(
    zeroParamsParseResult.options.help,
    'Should have help option as true',
  );

  // 2. One parameter case
  const oneParamParseResult = parser.parse(['init']);
  assertEquals(oneParamParseResult.type, 'one', 'Should parse as one param');
  assertEquals(oneParamParseResult.params, ['init'], 'Should include init command');

  // 3. Two parameter case
  const twoParamsParseResult = parser.parse(['to', 'project']);
  assertEquals(twoParamsParseResult.type, 'two', 'Should parse as two params');
  assertEquals(twoParamsParseResult.params, ['to', 'project'], 'Should include both parameters');

  // 4. Error case
  const errorParseResult = parser.parse(['invalid', 'command']);
  logger.debug('Error parse result', {
    data: { type: errorParseResult.type, error: errorParseResult.error },
  });
  assertEquals(errorParseResult.type, 'error', 'Should parse as error');
  assertEquals(errorParseResult.params, [], 'Should have empty params for error');
  assertEquals(typeof errorParseResult.error, 'object', 'Should have error object');

  // 5. Complex case - two params with valid options
  const complexParseResult = parser.parse([
    'to',
    'project',
    '--from=input.md',
    '--config=test.json',
  ]);
  assertEquals(complexParseResult.type, 'two', 'Should parse as two params with options');
  assertEquals(complexParseResult.params.length, 2, 'Should include only parameters');
  assertEquals(complexParseResult.options.from, 'input.md', 'Should have from option');
  assertEquals(
    complexParseResult.options.config,
    'test.json',
    'Should have config option',
  );
});

Deno.test('flag option with value should return error (--help=true)', () => {
  const parser = new ParamsParser(optionRule);
  const result = parser.parse(['--help=true']);
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    'Flag option --help should not have a value',
  );
  assertEquals(result.error?.category, 'invalid_format');
});

Deno.test('flag option with value should return error (--version=true)', () => {
  const parser = new ParamsParser(optionRule);
  const result = parser.parse(['--version=true']);
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    'Flag option --version should not have a value',
  );
  assertEquals(result.error?.category, 'invalid_format');
});
