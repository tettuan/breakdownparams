import { assert, assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../../mod.ts';
import { type CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../../../types/custom_config.ts';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../option_validator.ts';
import { DEFAULT_OPTION_RULE } from '../../../types/option_rule.ts';

/**
 * Phase 1 patch (v1.2.3) regression tests.
 *
 * Purpose: Verify that OptionValidator (Zero/One/Two) consults
 * `CustomConfig.validation.{zero,one,two}.allowedOptions` instead of
 * a hard-coded list, and that ParamsParser injects CustomConfig into
 * the validators it creates.
 *
 * Reference: docs/custom_params.md(.ja.md) section 2.3
 *            docs/architecture/layer1_overview.ja.md
 *            docs/architecture/layer2_diagrams.ja.md
 */
Deno.test('Phase1: OptionValidator honors CustomConfig (Issue #23 family)', async (t) => {
  await t.step('Issue #23: init --config=test passes with default config', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['init', '--config=test']);

    assertEquals(result.type, 'one');
    if (result.type === 'one') {
      assertEquals(result.options.config, 'test');
    }
  });

  await t.step('one-mode: empty allowedOptions rejects --config', () => {
    const customConfig: CustomConfig = {
      ...DEFAULT_CUSTOM_CONFIG,
      validation: {
        ...DEFAULT_CUSTOM_CONFIG.validation,
        one: {
          allowedOptions: [],
          allowedValueOptions: [],
          allowUserVariables: false,
        },
      },
    };
    const parser = new ParamsParser(undefined, customConfig);
    const result = parser.parse(['init', '--config=test']);

    assertEquals(result.type, 'error');
  });

  await t.step('two-mode: allowedOptions=["from"] rejects --config', () => {
    const customConfig: CustomConfig = {
      ...DEFAULT_CUSTOM_CONFIG,
      validation: {
        ...DEFAULT_CUSTOM_CONFIG.validation,
        two: {
          allowedOptions: ['from'],
          allowedValueOptions: ['from'],
          allowUserVariables: true,
        },
      },
    };
    const parser = new ParamsParser(undefined, customConfig);
    const result = parser.parse(['to', 'project', '--config=x']);

    assertEquals(result.type, 'error');
  });

  await t.step('zero-mode: allowedOptions=["help"] rejects --version', () => {
    const customConfig: CustomConfig = {
      ...DEFAULT_CUSTOM_CONFIG,
      validation: {
        ...DEFAULT_CUSTOM_CONFIG.validation,
        zero: {
          allowedOptions: ['help'],
          allowedValueOptions: [],
          allowUserVariables: false,
        },
      },
    };
    const parser = new ParamsParser(undefined, customConfig);
    const result = parser.parse(['--version']);

    assertEquals(result.type, 'error');
  });

  await t.step('regression: standard two-mode options still pass', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['to', 'project', '--from=in.md']);

    assertEquals(result.type, 'two');
    if (result.type === 'two') {
      assertEquals(result.options.from, 'in.md');
    }
  });
});

Deno.test('Phase1: OptionValidator constructors accept CustomConfig (backward compatible)', async (t) => {
  await t.step('ZeroOptionValidator: no-arg constructor still works', () => {
    const validator = new ZeroOptionValidator();
    const result = validator.validate(['--help'], 'zero', DEFAULT_OPTION_RULE);
    assert(result.isValid);
  });

  await t.step('OneOptionValidator: CustomConfig-injected constructor works', () => {
    const validator = new OneOptionValidator(DEFAULT_CUSTOM_CONFIG);
    const result = validator.validate(['--config=test'], 'one', DEFAULT_OPTION_RULE);
    assert(result.isValid);
    assertEquals(result.options?.config, 'test');
  });

  await t.step('TwoOptionValidator: CustomConfig-injected constructor works', () => {
    const validator = new TwoOptionValidator(DEFAULT_CUSTOM_CONFIG);
    const result = validator.validate(['--from=test'], 'two', DEFAULT_OPTION_RULE);
    assert(result.isValid);
    assertEquals(result.options?.from, 'test');
  });
});
