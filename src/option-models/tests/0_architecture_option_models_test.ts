import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { FlagOption } from '../flag_option.ts';
import { ValueOption } from '../value_option.ts';
import { UserVariableOption } from '../user_variable_option.ts';
import { OptionType } from '../../types/option_type.ts';

const logger = new BreakdownLogger('option-model');

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
    const userOption = new UserVariableOption('--uv-config', 'Configuration');

    assert(flagOption instanceof FlagOption);
    assert(valueOption instanceof ValueOption);
    assert(userOption instanceof UserVariableOption);
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
    const userOption = new UserVariableOption('--uv-config', 'Configuration');

    assertEquals(flagOption.type, OptionType.FLAG);
    assertEquals(valueOption.type, OptionType.VALUE);
    assertEquals(userOption.type, OptionType.USER_VARIABLE);
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
    const userOption = new UserVariableOption('--uv-config', 'Configuration');

    const flagResult = flagOption.validate();
    const valueResult = valueOption.validate('test.txt');
    const customResult = userOption.validate('--uv-config=test_config');

    logger.debug('flagResult:', flagResult);
    logger.debug('valueResult:', valueResult);
    logger.debug('customResult:', customResult);

    assert(flagResult.isValid);
    assert(valueResult.isValid);
    assert(customResult.isValid);
  });
});
