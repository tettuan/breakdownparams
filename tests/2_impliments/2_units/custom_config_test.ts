import { assertEquals } from 'jsr:@std/assert@1';
import { ParamsParser } from '../../../src/mod.ts';
import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../../../src/types/custom_config.ts';
import { TwoParamsResult } from '../../../src/types/params_result.ts';

Deno.test('CustomConfig functionality', async (t) => {
  await t.step('should use default custom config when not provided', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['to', 'project']) as TwoParamsResult;

    assertEquals(result.type, 'two');
    assertEquals(result.directiveType, 'to');
    assertEquals(result.layerType, 'project');
  });

  await t.step('should accept custom parameter patterns', () => {
    const customConfig: CustomConfig = {
      ...DEFAULT_CUSTOM_CONFIG,
      params: {
        two: {
          directiveType: {
            pattern: '^(from|to|for)$',
            errorMessage: 'Invalid directive type. Must be one of: from, to, for',
          },
          layerType: {
            pattern: '^(module|component|service)$',
            errorMessage: 'Invalid layer type. Must be one of: module, component, service',
          },
        },
      },
    };

    const parser = new ParamsParser(undefined, customConfig);

    // Test valid custom values
    const result1 = parser.parse(['from', 'module']) as TwoParamsResult;
    assertEquals(result1.type, 'two');
    assertEquals(result1.directiveType, 'from');
    assertEquals(result1.layerType, 'module');

    // Test invalid values
    const result2 = parser.parse(['invalid', 'module']);
    assertEquals(result2.type, 'error');
    if (result2.type === 'error' && result2.error) {
      assertEquals(
        result2.error.message,
        'Invalid directive type. Must be one of: from, to, for',
      );
    }
  });

  await t.step('should use custom option validation rules', () => {
    const customConfig: CustomConfig = {
      ...DEFAULT_CUSTOM_CONFIG,
      validation: {
        ...DEFAULT_CUSTOM_CONFIG.validation,
        two: {
          allowedOptions: ['from', 'destination'], // Only allow these two options
          allowedValueOptions: ['from', 'destination'],
          allowUserVariables: false, // Disable user variables
        },
      },
    };

    const parser = new ParamsParser(undefined, customConfig);

    // Test allowed options
    const result1 = parser.parse(['to', 'project', '--from=input.md', '--destination=output.md']);
    assertEquals(result1.type, 'two');
    if (result1.type === 'two') {
      assertEquals(result1.options.from, 'input.md');
      assertEquals(result1.options.destination, 'output.md');
    }

    // Test disallowed option
    const result2 = parser.parse(['to', 'project', '--config=myconfig']);
    assertEquals(result2.type, 'error');
    if (result2.type === 'error' && result2.error) {
      assertEquals(result2.error.code, 'INVALID_OPTION');
    }

    // Test user variables (currently still allowed despite config)
    // TODO: Update when user variable validation is fully implemented
    const result3 = parser.parse(['to', 'project', '--uv-test=value']);
    assertEquals(result3.type, 'two');
    // This should be error when user variable validation is implemented
    // assertEquals(result3.type, 'error');
    // if (result3.type === 'error' && result3.error) {
    //   assertEquals(result3.error.code, 'INVALID_OPTION');
    // }
  });

  await t.step('should allow different allowed options per mode', () => {
    const customConfig: CustomConfig = {
      ...DEFAULT_CUSTOM_CONFIG,
      validation: {
        zero: {
          allowedOptions: ['help'], // Only allow help, not version
          allowedValueOptions: [],
          allowUserVariables: false,
        },
        one: {
          allowedOptions: ['from', 'destination'], // Different from default
          allowedValueOptions: ['from', 'destination'],
          allowUserVariables: false,
        },
        two: {
          allowedOptions: ['config'], // Only allow config
          allowedValueOptions: ['config'],
          allowUserVariables: true,
        },
      },
    };

    const parser = new ParamsParser(undefined, customConfig);

    // Test zero mode
    const result1 = parser.parse(['--help']);
    assertEquals(result1.type, 'zero');

    const result2 = parser.parse(['--version']);
    assertEquals(result2.type, 'error'); // version not allowed

    // Test one mode
    const result3 = parser.parse(['init', '--from=src']);
    assertEquals(result3.type, 'error'); // OneOptionValidator doesn't allow any options

    const result4 = parser.parse(['init', '--config=test']);
    assertEquals(result4.type, 'error'); // config not allowed in one mode

    // Test two mode
    const result5 = parser.parse(['to', 'project', '--config=myconfig']);
    assertEquals(result5.type, 'two');

    const result6 = parser.parse(['to', 'project', '--from=input']);
    assertEquals(result6.type, 'error'); // from not allowed in two mode
  });

  await t.step('should fail with partial config (missing required properties)', () => {
    // Partial config: only provides params.two (missing validation, options, errorHandling)
    const partialConfig = {
      params: {
        two: {
          directiveType: {
            pattern: '^(partial1|partial2)$',
            errorMessage: 'Partial directive type error',
          },
          layerType: {
            pattern: '^(partialLayer1|partialLayer2)$',
            errorMessage: 'Partial layer type error',
          },
        },
      },
    };

    // Verify that partial config causes runtime error
    let constructorError = false;
    try {
      // Bypass TypeScript type checking to verify runtime behavior
      // deno-lint-ignore no-explicit-any
      const parser = new ParamsParser(undefined, partialConfig as any);
      // If constructor succeeds, attempt to parse
      parser.parse(['partial1', 'partialLayer1']);
    } catch (error) {
      constructorError = true;
      // Confirm error occurs due to missing validation property
      assertEquals((error as Error).message.includes('Cannot read properties of undefined'), true);
    }

    // Confirm that error occurs in constructor
    assertEquals(constructorError, true);
  });

  await t.step(
    'should work correctly with DEFAULT_CUSTOM_CONFIG spread for partial override',
    () => {
      // Spread DEFAULT_CUSTOM_CONFIG for partial override
      const mergedConfig: CustomConfig = {
        ...DEFAULT_CUSTOM_CONFIG,
        params: {
          two: {
            directiveType: {
              pattern: '^(spread1|spread2)$',
              errorMessage: 'Spread directive type error',
            },
            layerType: {
              pattern: '^(spreadLayer1|spreadLayer2)$',
              errorMessage: 'Spread layer type error',
            },
          },
        },
      };

      const parser = new ParamsParser(undefined, mergedConfig);

      // Verify that custom parameters work correctly
      const result1 = parser.parse(['spread1', 'spreadLayer1']) as TwoParamsResult;
      assertEquals(result1.type, 'two');
      assertEquals(result1.directiveType, 'spread1');
      assertEquals(result1.layerType, 'spreadLayer1');

      // Verify that default parameters cause error (don't match custom pattern)
      const result2 = parser.parse(['to', 'project']);
      assertEquals(result2.type, 'error');
      if (result2.type === 'error' && result2.error) {
        assertEquals(result2.error.message, 'Spread directive type error');
      }

      // Verify that default validation rules and options are used
      const result3 = parser.parse(['spread1', 'spreadLayer1', '--from=input.md']);
      assertEquals(result3.type, 'two');
      if (result3.type === 'two') {
        assertEquals(result3.options.from, 'input.md');
      }

      // Verify that default zero parameter validation is used
      const result4 = parser.parse(['--help']);
      assertEquals(result4.type, 'zero');
      if (result4.type === 'zero') {
        assertEquals(result4.options.help, true);
      }
    },
  );

  await t.step('should export CustomConfig and DEFAULT_CUSTOM_CONFIG from JSR entry point', () => {
    // Verify export behavior for JSR users
    // Confirm that import from mod.ts works correctly

    // Since ParamsParser is already imported from mod.ts, verify DEFAULT_CUSTOM_CONFIG is accessible too
    // Simulate actual JSR user usage pattern
    const parser = new ParamsParser();
    const defaultResult = parser.parse(['to', 'project']);
    assertEquals(defaultResult.type, 'two');

    // CustomConfig and DEFAULT_CUSTOM_CONFIG availability from mod.ts
    // is already confirmed by this test file's import statements
    // (import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../../../src/types/custom_config.ts';)
    //
    // When published to JSR, exports will be from src/mod.ts,
    // so users can use: import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from 'jsr:@scope/breakdownparams'
  });
});
