import { assert } from "jsr:@std/assert@^0.218.2";
import { OptionRegistry } from "../0_architecture_option_registry.ts";
import { CommandLineOptionRegistry } from "../1_structure_option_registry.ts";

Deno.test('OptionRegistry Interface', async (t) => {
  const registry: OptionRegistry = new CommandLineOptionRegistry();

  await t.step('should implement all required methods', () => {
    assert(typeof registry.register === 'function');
    assert(typeof registry.get === 'function');
    assert(typeof registry.getAll === 'function');
    assert(typeof registry.extractOptions === 'function');
  });
}); 