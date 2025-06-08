import { assert, assertEquals } from "jsr:@std/assert@^0.218.2";
import { CommandLineOptionRegistry } from "../option_registry.ts";
import { OptionType } from "../../types/option_type.ts";
import { ValueOption } from "../../option-models/value_option.ts";
import { FlagOption } from "../../option-models/flag_option.ts";

Deno.test('Option Registry Unit Operations', async (t) => {
  await t.step('register should store option and its aliases', () => {
    const registry = new CommandLineOptionRegistry();
    const option = new ValueOption(
      '--test',
      ['-t'],
      true,
      'Test option',
      (_v) => ({ isValid: true, validatedParams: [] })
    );
    registry.register(option);

    const retrieved = registry.get('--test');
    assert(retrieved === option);

    const alias = registry.get('-t');
    assert(alias === option);
  });

  await t.step('getAll should return unique options', () => {
    const registry = new CommandLineOptionRegistry();
    
    const option1 = new ValueOption(
      '--test1',
      ['-t1'],
      true,
      'Test option 1',
      (_v) => ({ isValid: true, validatedParams: [] })
    );
    
    const option2 = new FlagOption(
      '--test2',
      ['-t2'],
      'Test flag'
    );

    registry.register(option1);
    registry.register(option2);

    const options = registry.getAll();
    assertEquals(options.length, 2);
    assert(options.includes(option1));
    assert(options.includes(option2));
  });

  await t.step('extractOptions should parse command line arguments', () => {
    const registry = new CommandLineOptionRegistry();
    const args = ['--test=value', '--flag', '--custom=123'];
    
    const extracted = registry.extractOptions(args);
    assertEquals(extracted.length, 3);
    assertEquals(extracted[0], { name: 'test', value: 'value' });
    assertEquals(extracted[1], { name: 'flag', value: true });
    assertEquals(extracted[2], { name: 'custom', value: '123' });
  });
}); 