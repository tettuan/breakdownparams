import { assertEquals } from 'jsr:@std/assert@1';
import { SecurityValidator } from '../../../src/validator/security_validator.ts';
import { ZeroOptionValidator } from '../../../src/validator/options/option_validator.ts';
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

Deno.test('test_validator_result_integration', () => {
  // Test: Security error validator results
  const securityValidator = new SecurityValidator();
  const securityResult = securityValidator.validate(['safe;command']);
  assertEquals(
    securityResult.isValid,
    false,
    'Security validation should fail for dangerous command',
  );
  assertEquals(
    securityResult.validatedParams,
    ['safe;command'],
    'Validated params should include the input even for security error',
  );
  assertEquals(typeof securityResult.errorMessage, 'string', 'Should have error message');
  assertEquals(typeof securityResult.errorCode, 'string', 'Should have error code');
  assertEquals(typeof securityResult.errorCategory, 'string', 'Should have error category');

  // Test: Option validator results
  const zeroOptionValidator = new ZeroOptionValidator();
  const optionsResult = zeroOptionValidator.validate(['--help', '--version'], 'zero', optionRule);
  assertEquals(optionsResult.isValid, true, 'Options validation should pass for valid options');
  assertEquals(
    optionsResult.validatedParams,
    [],
    'Option validator should return empty validated params',
  );

  // Test: Zero parameter validator results
  const zeroParamsValidator = new ZeroParamsValidator();
  const zeroParamsResult = zeroParamsValidator.validate([]);
  assertEquals(
    zeroParamsResult.isValid,
    true,
    'Zero params validation should pass for empty params',
  );
  assertEquals(zeroParamsResult.validatedParams, [], 'Validated params should be empty');

  // Test: One parameter validator results
  const oneParamValidator = new OneParamValidator();
  const oneParamResult = oneParamValidator.validate(['init']);
  assertEquals(oneParamResult.isValid, true, 'One param validation should pass for init command');
  assertEquals(oneParamResult.validatedParams, ['init'], 'Validated params should match input');

  // Test: Two parameter validator results
  const twoParamsValidator = new TwoParamsValidator();
  const twoParamsResult = twoParamsValidator.validate(['to', 'project']);
  assertEquals(
    twoParamsResult.isValid,
    true,
    'Two params validation should pass for valid parameters',
  );
  assertEquals(
    twoParamsResult.validatedParams,
    ['to', 'project'],
    'Validated params should match input',
  );

  // Test: Error case results
  const invalidOptionsResult = zeroOptionValidator.validate(
    ['--invalid-option'],
    'zero',
    optionRule,
  );
  assertEquals(
    invalidOptionsResult.isValid,
    false,
    'Options validation should fail for invalid option',
  );
  assertEquals(
    invalidOptionsResult.validatedParams,
    [],
    'Validated params should be empty for invalid option',
  );
  assertEquals(typeof invalidOptionsResult.errorMessage, 'string', 'Should have error message');
  assertEquals(typeof invalidOptionsResult.errorCode, 'string', 'Should have error code');
  assertEquals(typeof invalidOptionsResult.errorCategory, 'string', 'Should have error category');

  // Test: Complex case results
  const complexResult = twoParamsValidator.validate(['to', 'project']);
  assertEquals(complexResult.isValid, true, 'Complex validation should pass for valid parameters');
  assertEquals(
    complexResult.validatedParams,
    ['to', 'project'],
    'Validated params should match input',
  );
  // directiveType and layerType are properties of ParamsResult, not ValidationResult

  // Test: Error details
  const errorResult = securityValidator.validate(['dangerous;command']);
  assertEquals(errorResult.isValid, false, 'Validation should fail for dangerous command');
  assertEquals(typeof errorResult.errorMessage, 'string', 'Should have error message');
  assertEquals(typeof errorResult.errorCode, 'string', 'Should have error code');
  assertEquals(errorResult.errorCategory, 'security', 'Should have security category');
});
