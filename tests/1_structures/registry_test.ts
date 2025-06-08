import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { DefaultOptionRegistry } from '../../src/options/registry.ts';
import { CustomVariableOption, FlagOption, ValueOption } from '../../src/options/base.ts';
import { OptionType } from '../../src/options/types.ts';

Deno.test('OptionRegistry', async (t) => {
  const registry = new DefaultOptionRegistry();

  await t.step('should register and retrieve options', () => {
    const validator = (_v: string) => ({ isValid: true, validatedParams: [], errors: [] });
    const option = new ValueOption('test', ['t'], true, 'Test option', validator);
    registry.register(option);

    const retrieved = registry.get('test');
    assert(retrieved === option);

    const alias = registry.get('t');
    assert(alias === option);
  });

  await t.step('should validate custom variables', () => {
    assert(registry.validateCustomVariable('uv-test'));
    assert(!registry.validateCustomVariable('invalid'));
  });

  await t.step('should get all registered options', () => {
    const registry = new DefaultOptionRegistry();
    const validator = (_v: string) => ({ isValid: true, validatedParams: [], errors: [] });
    const option1 = new ValueOption('test1', ['t1'], true, 'Test option 1', validator);
    const option2 = new FlagOption('test2', ['t2'], 'Test flag');
    const pattern = /^uv-[a-zA-Z0-9_]+$/;
    const option3 = new CustomVariableOption('uv-test3', [], 'Test variable', pattern);

    registry.register(option1);
    registry.register(option2);
    registry.register(option3);

    const options = registry.getAll();
    console.log('Registered options:', {
      count: options.length,
      options: options.map(o => ({
        name: o.name,
        type: o.type,
        aliases: o.aliases,
      })),
    });
    assertEquals(options.length, 3);
    assert(options.includes(option1));
    assert(options.includes(option2));
    assert(options.includes(option3));
  });

  await t.step('should register flag option with correct structure', () => {
    const option = new FlagOption('help', ['h'], 'Show help');
    registry.register(option);

    const retrieved = registry.get('help');
    assert(retrieved?.type === OptionType.FLAG);
    assertEquals(retrieved?.name, 'help');
    assertEquals(retrieved?.aliases, ['h']);
  });

  await t.step('should handle flag option aliases correctly', () => {
    const option = new FlagOption('help', ['h'], 'Show help');
    registry.register(option);

    const byName = registry.get('help');
    const byAlias = registry.get('h');
    assertEquals(byName, byAlias);
  });
});
