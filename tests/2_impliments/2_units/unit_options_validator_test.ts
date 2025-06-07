import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionsValidator } from '../../../src/validator/options_validator.ts';
import { OptionRule } from '../../../src/result/types.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--demonstrative-type', '--layer-type'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  flagOptions: {
    'help': 'help',
    'version': 'version',
  },
  paramSpecificOptions: {
    zero: { allowedOptions: ['help', 'version'], requiredOptions: [] },
    one: { allowedOptions: ['help', 'version'], requiredOptions: [] },
    two: {
      allowedOptions: ['help', 'version', 'config', 'uv-project', 'uv-version', 'uv-environment'],
      requiredOptions: [],
    },
  },
};

Deno.test('test_options_validator', () => {
  const validator = new OptionsValidator(optionRule);

  // Pre-processing and Preparing Part
  console.log('[DEBUG] Testing OptionsValidator with different scenarios');

  // Main Test
  // 1. オプションのみのケース
  const optionsOnlyResult = validator.validate(['help', 'version']);
  console.log('[DEBUG] optionsOnlyResult:', optionsOnlyResult);
  assertEquals(optionsOnlyResult.isValid, true, 'Options only should be valid');
  assertEquals(
    optionsOnlyResult.validatedParams,
    ['help', 'version'],
    'Validated params should match input',
  );

  // 2. 位置引数とオプションの組み合わせ
  const paramsWithOptionsResult = validator.validate(['to', 'project', 'help', 'version']);
  console.log('[DEBUG] paramsWithOptionsResult:', paramsWithOptionsResult);
  assertEquals(paramsWithOptionsResult.isValid, true, 'Params with options should be valid');
  assertEquals(
    paramsWithOptionsResult.validatedParams,
    ['to', 'project', 'help', 'version'],
    'Validated params should match input',
  );

  // 3. 形式が不正なオプション
  const invalidFormatResult = validator.validate(['-invalid']);
  console.log('[DEBUG] invalidFormatResult:', invalidFormatResult);
  assertEquals(invalidFormatResult.isValid, false, 'Invalid format option should be invalid');
  assertEquals(
    invalidFormatResult.error?.code,
    'VALIDATION_ERROR',
    'Error code should be VALIDATION_ERROR',
  );
  assertEquals(
    invalidFormatResult.error?.category,
    'invalid_format',
    'Error category should be invalid_format',
  );

  // 4. 重複したオプション
  const duplicateOptionResult = validator.validate(['help', 'help']);
  console.log('[DEBUG] duplicateOptionResult:', duplicateOptionResult);
  assertEquals(duplicateOptionResult.isValid, false, 'Duplicate options should be invalid');
  assertEquals(
    duplicateOptionResult.error?.code,
    'VALIDATION_ERROR',
    'Error code should be VALIDATION_ERROR',
  );
  assertEquals(
    duplicateOptionResult.error?.category,
    'duplicate_option',
    'Error category should be duplicate_option',
  );

  // 5. 未知のオプション（形式は正しいが、flagOptionsに定義されていない）
  const unknownOptionResult = validator.validate(['unknown']);
  console.log('[DEBUG] unknownOptionResult:', unknownOptionResult);
  assertEquals(
    unknownOptionResult.isValid,
    true,
    'Unknown option with valid format should be valid',
  );
  assertEquals(
    unknownOptionResult.validatedParams,
    ['unknown'],
    'Validated params should match input',
  );
});
