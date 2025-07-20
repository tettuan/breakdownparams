import { assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BaseValidator } from '../../src/validator/params/base_validator.ts';
import { SecurityValidator } from '../../src/validator/security_validator.ts';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../../src/validator/options/option_validator.ts';
import { ZeroParamsValidator } from '../../src/validator/params/zero_params_validator.ts';
import { OneParamValidator } from '../../src/validator/params/one_param_validator.ts';
import { TwoParamsValidator } from '../../src/validator/params/two_params_validator.ts';
import { DEFAULT_OPTION_RULE } from '../../src/types/option_rule.ts';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../../src/validator/options/option_combination_rule.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../src/types/custom_config.ts';

Deno.test('test_base_validator_interface', () => {
  assertEquals(
    Object.getOwnPropertyDescriptor(BaseValidator.prototype, 'validate')?.get,
    undefined,
  );
  assertEquals(
    Object.getOwnPropertyDescriptor(BaseValidator.prototype, 'validate')?.set,
    undefined,
  );
  assertEquals(
    Object.getOwnPropertyDescriptor(BaseValidator.prototype, 'validate')?.value,
    undefined,
  );
});

Deno.test('test_security_validator_interface', () => {
  const validator = new SecurityValidator();
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_zero_option_validator_interface', () => {
  const validator = new ZeroOptionValidator();
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_one_option_validator_interface', () => {
  const validator = new OneOptionValidator();
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_two_option_validator_interface', () => {
  const validator = new TwoOptionValidator();
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_zero_params_validator_interface', () => {
  const validator = new ZeroParamsValidator();
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_one_param_validator_interface', () => {
  const validator = new OneParamValidator();
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_two_params_validator_interface', () => {
  const validator = new TwoParamsValidator();
  assertEquals(validator instanceof BaseValidator, true);
  assertEquals(typeof validator.validate, 'function');
});

Deno.test('test_validation_rules_location', () => {
  /**
   * Verify option rule definition location
   * Ensures DEFAULT_OPTION_RULE is properly exported and accessible
   */
  assertEquals(typeof DEFAULT_OPTION_RULE, 'object');

  /**
   * Verify option combination rules location
   * Ensures DEFAULT_OPTION_COMBINATION_RULES is properly exported
   */
  assertEquals(typeof DEFAULT_OPTION_COMBINATION_RULES, 'object');

  /**
   * Verify parameter configuration location
   * Ensures DEFAULT_CUSTOM_CONFIG is properly exported
   */
  assertEquals(typeof DEFAULT_CUSTOM_CONFIG, 'object');
});

Deno.test('test_validation_rules_structure', () => {
  /**
   * Test: Option rule structure validation
   * Verifies DEFAULT_OPTION_RULE contains all required properties
   */
  assertEquals(DEFAULT_OPTION_RULE.format, '--key=value');
  assertEquals(typeof DEFAULT_OPTION_RULE.flagOptions, 'object');
  assertEquals(Array.isArray(DEFAULT_OPTION_RULE.rules.customVariables), true);
  assertEquals(Array.isArray(DEFAULT_OPTION_RULE.rules.requiredOptions), true);
  assertEquals(Array.isArray(DEFAULT_OPTION_RULE.rules.valueTypes), true);
  assertEquals(typeof DEFAULT_OPTION_RULE.errorHandling, 'object');

  /**
   * Test: Option combination rules structure
   * Verifies rules exist for zero, one, and two parameter modes
   */
  assertEquals(typeof DEFAULT_OPTION_COMBINATION_RULES.zero, 'object');
  assertEquals(typeof DEFAULT_OPTION_COMBINATION_RULES.one, 'object');
  assertEquals(typeof DEFAULT_OPTION_COMBINATION_RULES.two, 'object');

  /**
   * Test: Parameter configuration structure
   * Verifies directiveType and layerType configurations exist
   */
  assertEquals(typeof DEFAULT_CUSTOM_CONFIG.params.two.directiveType, 'object');
  assertEquals(typeof DEFAULT_CUSTOM_CONFIG.params.two.layerType, 'object');
});

Deno.test('test_validation_rules_default_values', () => {
  /**
   * Test: Option rule default values
   * Verifies that DEFAULT_OPTION_RULE contains expected default settings
   */
  assertEquals(DEFAULT_OPTION_RULE.flagOptions.help, true);
  assertEquals(DEFAULT_OPTION_RULE.flagOptions.version, true);
  assertEquals(DEFAULT_OPTION_RULE.errorHandling.emptyValue, 'error');
  assertEquals(DEFAULT_OPTION_RULE.errorHandling.unknownOption, 'error');
  assertEquals(DEFAULT_OPTION_RULE.errorHandling.duplicateOption, 'error');

  /**
   * Test: Option combination rules default values
   * Verifies expected allowed options for zero, one, and two parameter modes
   */
  assertEquals(DEFAULT_OPTION_COMBINATION_RULES.zero.allowedOptions, ['help', 'version']);
  assertEquals(DEFAULT_OPTION_COMBINATION_RULES.one.allowedOptions, ['config']);
  assertEquals(DEFAULT_OPTION_COMBINATION_RULES.one.requiredOptions, undefined);
  assertEquals(DEFAULT_OPTION_COMBINATION_RULES.two.allowedOptions, [
    'from',
    'destination',
    'config',
    'adaptation',
    'input',
  ]);
  assertEquals(DEFAULT_OPTION_COMBINATION_RULES.two.requiredOptions, undefined);

  /**
   * Test: Parameter configuration default values
   * Verifies regex patterns for directiveType and layerType validation
   */
  assertEquals(DEFAULT_CUSTOM_CONFIG.params.two.directiveType.pattern, '^(to|summary|defect)$');
  assertEquals(DEFAULT_CUSTOM_CONFIG.params.two.layerType.pattern, '^(project|issue|task)$');
});
