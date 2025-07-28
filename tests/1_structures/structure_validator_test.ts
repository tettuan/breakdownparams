import { assertEquals } from 'jsr:@std/assert@1';
import { BaseValidator } from '../../src/validator/params/base_validator.ts';
import { SecurityValidator } from '../../src/validator/security_validator.ts';
import { OptionCombinationValidator } from '../../src/validator/options/option_combination_validator.ts';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../../src/validator/options/option_combination_rule.ts';
import { ZeroParamsValidator } from '../../src/validator/params/zero_params_validator.ts';
import { OneParamValidator } from '../../src/validator/params/one_param_validator.ts';
import { TwoParamsValidator } from '../../src/validator/params/two_params_validator.ts';
import { CustomConfig } from '../../src/types/custom_config.ts';

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
  const config: CustomConfig = {
    params: {
      two: {
        directiveType: {
          pattern: '^(to|summary|defect)$',
          errorMessage: 'Invalid directive type',
        },
        layerType: {
          pattern: '^(project|issue|task)$',
          errorMessage: 'Invalid layer type',
        },
      },
    },
    options: {
      flags: {},
      values: {},
      userVariables: {
        pattern: '^uv-[a-zA-Z][a-zA-Z0-9_-]*$',
        description: 'User-defined variables',
      },
    },
    validation: {
      zero: {
        allowedOptions: [],
        allowUserVariables: false,
      },
      one: {
        allowedOptions: [],
        allowUserVariables: false,
      },
      two: {
        allowedOptions: [],
        allowUserVariables: false,
      },
    },
    errorHandling: {
      unknownOption: 'error',
      duplicateOption: 'error',
      emptyValue: 'error',
    },
  };
  const validator = new TwoParamsValidator(config);
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});
