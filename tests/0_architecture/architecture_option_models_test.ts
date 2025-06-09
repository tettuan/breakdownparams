import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../../src/option-models/flag_option.ts';
import { ValueOption } from '../../src/option-models/value_option.ts';
import { UserVariableOption } from '../../src/option-models/user_variable_option.ts';
import { OptionType } from '../../src/types/option_type.ts';

// 1. オプションモデルの基本設計確認
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

// 2. フラグオプションの設計確認
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

// 3. 値オプションの設計確認
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

// 4. ユーザー変数オプションの設計確認
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

// 5. オプションモデルの統合設計確認
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
