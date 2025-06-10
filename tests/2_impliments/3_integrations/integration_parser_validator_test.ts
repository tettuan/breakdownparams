import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
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
import { OptionRule } from '../../../src/types/option_rule.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  flagOptions: {
    help: true,
    version: true,
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

Deno.test('test_parser_validator_integration', () => {
  const parser = new ParamsParser(optionRule);

  // バリデーターの作成と検証
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
  assertEquals(
    securityValidator instanceof SecurityValidator,
    true,
    'Should create SecurityValidator',
  );
  assertEquals(
    paramValidators[0] instanceof ZeroParamsValidator,
    true,
    'First param validator should be ZeroParamsValidator',
  );
  assertEquals(
    paramValidators[1] instanceof OneParamValidator,
    true,
    'Second param validator should be OneParamValidator',
  );
  assertEquals(
    paramValidators[2] instanceof TwoParamsValidator,
    true,
    'Third param validator should be TwoParamsValidator',
  );

  // 各バリデーターの統合テスト
  // 1. セキュリティエラーバリデーター
  const securityResult = securityValidator.validate(['safe;command']);
  assertEquals(
    securityResult.isValid,
    false,
    'Security validator should reject dangerous commands',
  );

  // 2. オプションバリデーター
  const optionsResult = optionValidators[0].validate(['--help', '--version'], 'zero', optionRule);
  assertEquals(optionsResult.isValid, true, 'Options validator should accept valid options');

  // 3. ゼロパラメータバリデーター
  const zeroParamsResult = paramValidators[0].validate([]);
  assertEquals(zeroParamsResult.isValid, true, 'Zero params validator should accept empty params');

  // 4. 1パラメータバリデーター
  const oneParamResult = paramValidators[1].validate(['init']);
  assertEquals(oneParamResult.isValid, true, 'One param validator should accept init command');

  // 5. 2パラメータバリデーター
  const twoParamsResult = paramValidators[2].validate(['to', 'project']);
  assertEquals(
    twoParamsResult.isValid,
    true,
    'Two params validator should accept valid parameters',
  );

  // パーサーとバリデーターの統合テスト
  // 1. ゼロパラメータケース
  const zeroParamsParseResult = parser.parse(['--help']);
  assertEquals(zeroParamsParseResult.type, 'zero', 'Should parse as zero params');
  assertEquals(zeroParamsParseResult.params, [], 'Should have empty params');
  assertEquals(
    zeroParamsParseResult.options.help,
    true,
    'Should have help option as true',
  );

  // 2. 1パラメータケース
  const oneParamParseResult = parser.parse(['init']);
  assertEquals(oneParamParseResult.type, 'one', 'Should parse as one param');
  assertEquals(oneParamParseResult.params, ['init'], 'Should include init command');

  // 3. 2パラメータケース
  const twoParamsParseResult = parser.parse(['to', 'project']);
  assertEquals(twoParamsParseResult.type, 'two', 'Should parse as two params');
  assertEquals(twoParamsParseResult.params, ['to', 'project'], 'Should include both parameters');

  // 4. エラーケース
  const errorParseResult = parser.parse(['invalid', 'command']);
  assertEquals(errorParseResult.type, 'error', 'Should parse as error');
  assertEquals(errorParseResult.params, [], 'Should have empty params for error');
  assertEquals(typeof errorParseResult.error, 'object', 'Should have error object');

  // 5. 複合ケース - two params with valid options
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
