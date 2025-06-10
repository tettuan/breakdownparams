import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../../src/option-models/flag_option.ts';
import { OptionType } from '../../src/types/option_type.ts';
import { ValueOption } from '../../src/option-models/value_option.ts';
import { UserVariableOption } from '../../src/option-models/user_variable_option.ts';

// 1. 基本的な型の定義と値の確認
Deno.test('test_option_type_enum', () => {
  assertEquals(OptionType.VALUE, 'value');
  assertEquals(OptionType.FLAG, 'flag');
  assertEquals(OptionType.USER_VARIABLE, 'user_variable');
});

// 2. インターフェースの実装確認
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

// 3. 命名規則と設計原則の確認
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

// 4. 設計の一貫性確認
Deno.test('test_option_design_consistency', async (t) => {
  await t.step('should maintain consistent property types', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    assertEquals(typeof flagOption.name, 'string');
    assertEquals(Array.isArray(flagOption.aliases), true);
    assertEquals(typeof flagOption.description, 'string');
    assertEquals(typeof flagOption.isRequired, 'boolean');
  });

  await t.step('should maintain consistent method signatures', () => {
    const flagOption = new FlagOption('help', ['h'], 'Show help message');
    const validateResult = flagOption.validate();
    assert('isValid' in validateResult);
    assert('validatedParams' in validateResult);
  });
});

// 5. コンポーネント間の関係確認
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

    // 両方のオプションが同じインターフェースを実装していることを確認
    assert(flagOption.type === OptionType.FLAG);
    assert(valueOption.type === OptionType.VALUE);
    assert(flagOption.name !== valueOption.name);
    assert(flagOption.aliases[0] !== valueOption.aliases[0]);
  });
});
