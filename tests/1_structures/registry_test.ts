import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { DefaultOptionRegistry } from "../../src/options/registry.ts";
import { ValueOption, FlagOption, CustomVariableOption } from "../../src/options/base.ts";

Deno.test("OptionRegistry", async (t) => {
  const registry = new DefaultOptionRegistry();

  await t.step("should register and retrieve options", () => {
    const option = new ValueOption('test', ['t'], false, 'Test option', (v) => ({ isValid: true, errors: [] }));
    registry.register(option);
    
    const retrieved = registry.get('test');
    assert(retrieved === option);
    
    const alias = registry.get('t');
    assert(alias === option);
  });

  await t.step("should validate custom variables", () => {
    assert(registry.validateCustomVariable('uv-test'));
    assert(!registry.validateCustomVariable('invalid'));
  });

  await t.step("should get all registered options", () => {
    const registry = new DefaultOptionRegistry();
    const option1 = new ValueOption('test1', ['t1'], false, 'Test option 1', (v) => ({ isValid: true, errors: [] }));
    const option2 = new FlagOption('test2', ['t2'], 'Test flag');
    const option3 = new CustomVariableOption('uv-test3', 'Test variable', /^uv-[a-zA-Z0-9_]+$/);

    registry.register(option1);
    registry.register(option2);
    registry.register(option3);

    const options = registry.getAll();
    assertEquals(options.length, 3);
    assert(options.includes(option1));
    assert(options.includes(option2));
    assert(options.includes(option3));
  });
}); 