import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../../src/option-models/flag_option.ts';
import { ValueOption } from '../../src/option-models/value_option.ts';
import { UserVariableOption } from '../../src/option-models/user_variable_option.ts';
import { OptionType } from '../../src/types/option_type.ts';

/**
 * Test 1: Basic option model design verification
 *
 * Purpose:
 * Validates the fundamental design of option model classes and their
 * proper instantiation behavior.
 *
 * Background:
 * The option model architecture consists of three main types: FlagOption,
 * ValueOption, and UserVariableOption. Each must be properly instantiable
 * and maintain correct inheritance relationships.
 *
 * Intent:
 * - Verify all option types can be instantiated correctly
 * - Ensure instanceof relationships work as expected
 * - Validate basic object-oriented design principles
 */
Deno.test('test_option_model_design', async (t) => {
  await t.step('should maintain option model interfaces', () => {
    const flagOption = new FlagOption('--help', ['h'], 'Show help message');
    const valueOption = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    const customOption = new UserVariableOption('--uv-config', 'Configuration');

    assert(flagOption instanceof FlagOption);
    assert(valueOption instanceof ValueOption);
    assert(customOption instanceof UserVariableOption);
  });
});

/**
 * Test 2: Flag option design verification
 *
 * Purpose:
 * Validates the complete design and behavior of FlagOption class,
 * including structure, validation, and value handling.
 *
 * Background:
 * Flag options represent boolean command-line options like --help or --version
 * that don't take values. They should have consistent structure and behavior.
 *
 * Intent:
 * - Verify flag option structure (name, aliases, description, type)
 * - Test validation behavior (should always be valid)
 * - Confirm getValue returns boolean true for flags
 * - Ensure isRequired defaults to false for flags
 */
Deno.test('test_flag_option_design', async (t) => {
  await t.step('should maintain flag option structure', () => {
    const option = new FlagOption('--help', ['h'], 'Show help message');
    assertEquals(option.name, '--help');
    assertEquals(option.aliases, ['h']);
    assertEquals(option.description, 'Show help message');
    assertEquals(option.type, OptionType.FLAG);
    assertEquals(option.isRequired, false);
  });

  await t.step('should validate flag options', () => {
    const option = new FlagOption('--help', ['h'], 'Show help message');
    const result = option.validate();
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
  });

  await t.step('should parse flag options', () => {
    const option = new FlagOption('--help', ['h'], 'Show help message');
    const result = option.getValue();
    assertEquals(result, true);
  });
});

/**
 * Test 3: Value option design verification
 *
 * Purpose:
 * Validates the complete design and behavior of ValueOption class,
 * including structure, validation, and value parsing.
 *
 * Background:
 * Value options represent command-line options that take values, like
 * --input=file.txt. They require custom validation logic and value parsing.
 *
 * Intent:
 * - Verify value option structure and properties
 * - Test validation with provided validator function
 * - Confirm parse method returns the provided value
 * - Ensure proper type assignment (OptionType.VALUE)
 */
Deno.test('test_value_option_design', async (t) => {
  await t.step('should maintain value option structure', () => {
    const option = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    assertEquals(option.name, '--input');
    assertEquals(option.aliases, ['i']);
    assertEquals(option.description, 'Input file');
    assertEquals(option.type, OptionType.VALUE);
    assertEquals(option.isRequired, false);
  });

  await t.step('should validate value options', () => {
    const option = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    const result = option.validate('test.txt');
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
  });

  await t.step('should parse value options', () => {
    const option = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    const result = option.parse('test.txt');
    assertEquals(result, 'test.txt');
  });
});

/**
 * Test 4: User variable option design verification
 *
 * Purpose:
 * Validates the design and behavior of UserVariableOption class for
 * handling dynamic user-defined variables.
 *
 * Background:
 * User variable options allow users to pass custom variables with the
 * --uv- prefix. They have no aliases and extract values from the full
 * option string.
 *
 * Intent:
 * - Verify user variable option structure (no aliases)
 * - Test validation with full option string format
 * - Confirm parsing extracts value from --uv-key=value format
 * - Ensure proper type assignment (OptionType.USER_VARIABLE)
 */
Deno.test('test_user_variable_option_design', async (t) => {
  await t.step('should maintain user variable option structure', () => {
    const option = new UserVariableOption('--uv-config', 'Configuration');
    assertEquals(option.name, '--uv-config');
    assertEquals(option.aliases, []);
    assertEquals(option.description, 'Configuration');
    assertEquals(option.type, OptionType.USER_VARIABLE);
    assertEquals(option.isRequired, false);
  });

  await t.step('should validate user variable options', () => {
    const option = new UserVariableOption('--uv-config', 'Configuration');
    const result = option.validate('--uv-config=test_config');
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
  });

  await t.step('should parse user variable options', () => {
    const option = new UserVariableOption('--uv-config', 'Configuration');
    const result = option.parse('--uv-config=test_config');
    assertEquals(result, 'test_config');
  });
});

/**
 * Test 5: Option model integration design verification
 *
 * Purpose:
 * Validates the integration and consistency of all option models working
 * together in a unified system.
 *
 * Background:
 * All option types must work together seamlessly, maintaining consistent
 * interfaces while providing type-specific behavior. The validation results
 * should be consistent across all types.
 *
 * Intent:
 * - Verify all option types have distinct type identifiers
 * - Ensure consistent validation result structure across types
 * - Test that different option types can coexist
 * - Validate polymorphic behavior through common interfaces
 */
Deno.test('test_option_model_integration_design', async (t) => {
  await t.step('should handle multiple option types', () => {
    const flagOption = new FlagOption('--help', ['h'], 'Show help message');
    const valueOption = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    const customOption = new UserVariableOption('--uv-config', 'Configuration');

    assertEquals(flagOption.type, OptionType.FLAG);
    assertEquals(valueOption.type, OptionType.VALUE);
    assertEquals(customOption.type, OptionType.USER_VARIABLE);
  });

  await t.step('should maintain consistent validation results', () => {
    const flagOption = new FlagOption('--help', ['h'], 'Show help message');
    const valueOption = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    const customOption = new UserVariableOption('--uv-config', 'Configuration');

    const flagResult = flagOption.validate();
    const valueResult = valueOption.validate('test.txt');
    const customResult = customOption.validate('--uv-config=test_config');

    assert(flagResult.isValid);
    assert(valueResult.isValid);
    assert(customResult.isValid);
  });
});
