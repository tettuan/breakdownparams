import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { FlagOption } from '../../src/option-models/flag_option.ts';
import { OptionType } from '../../src/types/option_type.ts';
import { ValueOption } from '../../src/option-models/value_option.ts';
import { UserVariableOption } from '../../src/option-models/user_variable_option.ts';

const logger = new BreakdownLogger('option-model');

/**
 * Test 1: Basic type definitions and value verification
 *
 * Purpose:
 * Validates that the OptionType enum contains the expected string values
 * for all supported option types.
 *
 * Background:
 * The OptionType enum serves as the discriminator for different option
 * implementations. Consistent enum values are critical for type safety.
 *
 * Intent:
 * - Verify VALUE enum equals 'value'
 * - Verify FLAG enum equals 'flag'
 * - Verify USER_VARIABLE enum equals 'user_variable'
 */
Deno.test('test_option_type_enum', () => {
  logger.debug('OptionType enum values', {
    data: {
      VALUE: OptionType.VALUE,
      FLAG: OptionType.FLAG,
      USER_VARIABLE: OptionType.USER_VARIABLE,
    },
  });
  assertEquals(OptionType.VALUE, 'value');
  assertEquals(OptionType.FLAG, 'flag');
  assertEquals(OptionType.USER_VARIABLE, 'user_variable');
});

/**
 * Test 2: Interface implementation verification
 *
 * Purpose:
 * Ensures all option classes properly implement the Option interface
 * with required properties and methods.
 *
 * Background:
 * All option types (Flag, Value, UserVariable) must implement a common
 * Option interface to ensure polymorphic behavior and type safety.
 *
 * Intent:
 * - Verify FlagOption implements all Option interface members
 * - Verify ValueOption implements all Option interface members
 * - Verify UserVariableOption implements all Option interface members
 * - Ensure consistent interface implementation across all types
 */
Deno.test('test_option_interface_implementation', async (t) => {
  await t.step('FlagOption should implement Option interface', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    assert('type' in flagOption);
    assert('name' in flagOption);
    assert('aliases' in flagOption);
    assert('description' in flagOption);
    assert('isRequired' in flagOption);
    assert('validate' in flagOption);
  });

  await t.step('ValueOption should implement Option interface', () => {
    const valueOption = new ValueOption(
      'input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    assert('type' in valueOption);
    assert('name' in valueOption);
    assert('aliases' in valueOption);
    assert('description' in valueOption);
    assert('isRequired' in valueOption);
    assert('validate' in valueOption);
    assert('parse' in valueOption);
  });

  await t.step('UserVariableOption should implement Option interface', () => {
    const userVarOption = new UserVariableOption('--uv-config', 'Configuration');
    assert('type' in userVarOption);
    assert('name' in userVarOption);
    assert('aliases' in userVarOption);
    assert('description' in userVarOption);
    assert('isRequired' in userVarOption);
    assert('validate' in userVarOption);
    assert('parse' in userVarOption);
  });
});

/**
 * Test 3: Naming conventions and design principles verification
 *
 * Purpose:
 * Validates that all option types follow consistent naming conventions
 * and adhere to established design principles.
 *
 * Background:
 * Consistent naming helps maintainability and reduces cognitive load.
 * Options should have clear names, appropriate aliases, and correct types.
 *
 * Intent:
 * - Verify flag options follow naming patterns (name, single-char alias)
 * - Verify value options follow naming patterns
 * - Verify user variable options use the --uv- prefix convention
 * - Ensure type assignments match the option class
 */
Deno.test('test_option_naming_conventions', async (t) => {
  await t.step('should follow naming conventions for flag options', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    assertEquals(flagOption.name, 'help');
    assertEquals(flagOption.aliases[0], 'h');
    assertEquals(flagOption.type, OptionType.FLAG);
  });

  await t.step('should follow naming conventions for value options', () => {
    const valueOption = new ValueOption(
      'input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    assertEquals(valueOption.name, 'input');
    assertEquals(valueOption.aliases[0], 'i');
    assertEquals(valueOption.type, OptionType.VALUE);
  });

  await t.step('should follow naming conventions for user variable options', () => {
    const userVarOption = new UserVariableOption('--uv-config', 'Configuration');
    assertEquals(userVarOption.name, '--uv-config');
    assertEquals(userVarOption.type, OptionType.USER_VARIABLE);
  });
});

/**
 * Test 4: Design consistency verification
 *
 * Purpose:
 * Ensures consistent property types and method signatures across all
 * option implementations.
 *
 * Background:
 * Consistency in design reduces bugs and makes the codebase more
 * predictable. All options should have the same property types and
 * method return types.
 *
 * Intent:
 * - Verify all properties have consistent types (string name, array aliases)
 * - Verify validate() method returns consistent result structure
 * - Ensure boolean properties are actually booleans
 * - Validate method signatures match interface contracts
 */
Deno.test('test_option_design_consistency', async (t) => {
  await t.step('should maintain consistent property types', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    assertEquals(typeof flagOption.name, 'string');
    assert(Array.isArray(flagOption.aliases));
    assertEquals(typeof flagOption.description, 'string');
    assertEquals(typeof flagOption.isRequired, 'boolean');
  });

  await t.step('should maintain consistent method signatures', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    const validateResult = flagOption.validate();
    logger.debug('flag option validate result for design consistency', {
      data: { isValid: validateResult.isValid, validatedParams: validateResult.validatedParams },
    });
    assert('isValid' in validateResult);
    assert('validatedParams' in validateResult);
  });
});

/**
 * Test 5: Component relationship verification
 *
 * Purpose:
 * Validates the relationships between different option components and
 * ensures proper type hierarchies.
 *
 * Background:
 * Option components must maintain proper relationships for the type
 * system to work correctly. Each option class should correctly identify
 * its type and maintain distinct identities.
 *
 * Intent:
 * - Verify instanceof relationships are correct
 * - Ensure type property matches the option class
 * - Validate that different option types maintain distinct properties
 * - Confirm polymorphic behavior works as expected
 */
Deno.test('test_option_component_relationships', async (t) => {
  await t.step('should maintain correct type relationships', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    assert(flagOption instanceof FlagOption);
    assert(flagOption.type === OptionType.FLAG);
  });

  await t.step('should maintain correct interface relationships', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    const valueOption = new ValueOption(
      'input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );

    // Verify both options implement the same interface but maintain distinct identities
    assert(flagOption.type === OptionType.FLAG);
    assert(valueOption.type === OptionType.VALUE);
    assert(flagOption.name !== valueOption.name);
    assert(flagOption.aliases[0] !== valueOption.aliases[0]);
  });
});
