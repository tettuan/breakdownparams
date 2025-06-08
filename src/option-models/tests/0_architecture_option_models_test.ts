import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../flag_option.ts';
import { ValueOption } from '../value_option.ts';
import { CustomVariableOption } from '../custom_variable_option.ts';
import { OptionType } from '../../types/option_type.ts';

Deno.test('Option Models Architecture', async (t) => {
  await t.step('should maintain option model interfaces', () => {
    const flagOption = new FlagOption('--help', ['h'], 'Show help message');
    const valueOption = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    const customOption = new CustomVariableOption('--uv-config', 'Configuration');

    assert(flagOption instanceof FlagOption);
    assert(valueOption instanceof ValueOption);
    assert(customOption instanceof CustomVariableOption);
  });

  await t.step('should maintain consistent type definitions', () => {
    const flagOption = new FlagOption('--help', ['h'], 'Show help message');
    const valueOption = new ValueOption(
      '--input',
      ['i'],
      false,
      'Input file',
      (_v) => ({ isValid: true, validatedParams: [] }),
    );
    const customOption = new CustomVariableOption('--uv-config', 'Configuration');

    assertEquals(flagOption.type, OptionType.FLAG);
    assertEquals(valueOption.type, OptionType.VALUE);
    assertEquals(customOption.type, OptionType.CUSTOM_VARIABLE);
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
    const customOption = new CustomVariableOption('--uv-config', 'Configuration');

    const flagResult = flagOption.validate();
    const valueResult = valueOption.validate('test.txt');
    const customResult = customOption.validate('--uv-config=test_config');

    console.log('flagResult:', flagResult);
    console.log('valueResult:', valueResult);
    console.log('customResult:', customResult);

    assert(flagResult.isValid);
    assert(valueResult.isValid);
    assert(customResult.isValid);
  });
});
