import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { OptionsValidator } from '../../../src/validator/options_validator.ts';
import { OptionRule } from '../../../src/result/types.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['uv-project', 'uv-version', 'uv-environment'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
  paramSpecificOptions: {
    zero: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    one: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    two: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
  },
};

Deno.test('test_options_validator_implementation', () => {
  const validator = new OptionsValidator(optionRule);

  // 有効なオプションのテスト
  const validArgs = [
    '--uv-project=myproject',
    '--uv-version=1.0.0',
    '--help',
    '--version',
  ];
  const validResult = validator.validate(validArgs);
  assertEquals(validResult.isValid, true, 'Valid options should pass validation');
  assertEquals(validResult.validatedParams, validArgs, 'Validated params should match input');

  // 空の値を持つオプションのテスト
  const emptyValueArgs = ['--option='];
  const emptyValueResult = validator.validate(emptyValueArgs);
  assertEquals(emptyValueResult.isValid, false, 'Options with empty values should fail validation');
  assertEquals(
    emptyValueResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  // 未知のオプションのテスト
  const unknownArgs = ['--unknown-option=value'];
  const unknownResult = validator.validate(unknownArgs);
  assertEquals(unknownResult.isValid, false, 'Unknown options should fail validation');
  assertEquals(
    unknownResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  // 重複したオプションのテスト
  const duplicateArgs = [
    '--uv-project=myproject',
    '--uv-project=otherproject',
  ];
  const duplicateResult = validator.validate(duplicateArgs);
  assertEquals(duplicateResult.isValid, false, 'Duplicate options should fail validation');
  assertEquals(
    duplicateResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );

  // フラグオプションのテスト
  const flagOptionArgs = ['--help', '--version'];
  const flagOptionResult = validator.validate(flagOptionArgs);
  assertEquals(flagOptionResult.isValid, true, 'Flag options should pass validation');
  assertEquals(
    flagOptionResult.validatedParams,
    flagOptionArgs,
    'Validated params should match input',
  );

  // 混合ケースのテスト
  const mixedArgs = [
    '--uv-project=myproject',
    '--unknown-option=value',
    '--help',
  ];
  const mixedResult = validator.validate(mixedArgs);
  assertEquals(
    mixedResult.isValid,
    false,
    'Mixed valid and invalid options should fail validation',
  );
  assertEquals(
    mixedResult.validatedParams,
    [],
    'Validated params should be empty for invalid input',
  );
});
