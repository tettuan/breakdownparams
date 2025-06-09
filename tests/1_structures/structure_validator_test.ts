import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { BaseValidator } from '../../src/validator/params/base_validator.ts';
import { SecurityValidator } from '../../src/validator/security_validator.ts';
import { OptionCombinationValidator } from '../../src/validator/options/option_combination_validator.ts';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../../src/validator/options/option_combination_rule.ts';
import { ZeroParamsValidator } from '../../src/validator/params/zero_params_validator.ts';
import { OneParamValidator } from '../../src/validator/params/one_param_validator.ts';
import { TwoParamsValidator } from '../../src/validator/params/two_params_validator.ts';
import { TwoParamsConfig } from '../../src/types/params_config.ts';

Deno.test('test_security_validator_structure', () => {
  const validator = new SecurityValidator();
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_option_combination_validator_structure', () => {
  const validator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES.zero);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_zero_params_validator_structure', () => {
  const validator = new ZeroParamsValidator();
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_one_param_validator_structure', () => {
  const validator = new OneParamValidator();
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_two_param_validator_structure', () => {
  const config: TwoParamsConfig = {
    demonstrativeType: {
      pattern: '^(to|summary|defect)$',
      errorMessage: 'Invalid demonstrative type',
    },
    layerType: {
      pattern: '^(project|issue|task)$',
      errorMessage: 'Invalid layer type',
    },
  };
  const validator = new TwoParamsValidator(config);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});
