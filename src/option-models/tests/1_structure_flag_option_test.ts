import { assert, assertEquals, assertThrows } from 'jsr:@std/assert@^0.218.2';
import { FlagOption } from '../flag_option.ts';
import { OptionType } from '../../types/option_type.ts';

Deno.test('FlagOption Structure', async (t) => {
  await t.step('should have correct structure', () => {
    const option = new FlagOption('--flag', ['-f'], 'Flag option');
    assert(option.type === OptionType.FLAG);
    assertEquals(option.isRequired, false);
    assertEquals(option.name, '--flag');
    assertEquals(option.aliases, ['-f']);
    assertEquals(option.description, 'Flag option');
  });

  await t.step('should validate option name in constructor', () => {
    // Valid names
    assert(new FlagOption('--valid-name', ['-v'], 'Valid name'));
    assert(new FlagOption('valid-name', ['-v'], 'Valid name without prefix'));

    // Invalid names
    assertThrows(
      () => new FlagOption('--123-invalid', ['-v'], 'Invalid: starts with number'),
      Error,
      'Invalid option name: Option name must start with a letter',
    );
    assertThrows(
      () => new FlagOption('--Invalid-Name', ['-v'], 'Invalid: uppercase'),
      Error,
      'Invalid option name: Option name must start with a letter',
    );
  });

  await t.step('should validate aliases in constructor', () => {
    // Valid aliases
    assert(new FlagOption('--test', ['-v'], 'Valid alias'));
    assert(new FlagOption('--test', ['v'], 'Valid alias without prefix'));

    // Invalid aliases
    assertThrows(
      () => new FlagOption('--test', ['1'], 'Invalid: starts with number'),
      Error,
      'Invalid alias: Option name must start with a letter',
    );
    assertThrows(
      () => new FlagOption('--test', ['-V'], 'Invalid: uppercase'),
      Error,
      'Invalid alias: Option name must start with a letter',
    );
  });

  await t.step('should validate flag option', () => {
    const option = new FlagOption('--flag', ['-f'], 'Flag option');
    const result = option.validate();
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
  });
});
