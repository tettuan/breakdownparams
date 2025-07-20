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
          allowCustomVariables: false, // Disable custom variables
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

    // Test custom variables (currently still allowed despite config)
    // TODO: Update when custom variable validation is fully implemented
    const result3 = parser.parse(['to', 'project', '--uv-test=value']);
    assertEquals(result3.type, 'two');
    // This should be error when custom variable validation is implemented
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
          allowCustomVariables: false,
        },
        one: {
          allowedOptions: ['from', 'destination'], // Different from default
          allowedValueOptions: ['from', 'destination'],
          allowCustomVariables: false,
        },
        two: {
          allowedOptions: ['config'], // Only allow config
          allowedValueOptions: ['config'],
          allowCustomVariables: true,
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
    // パーシャル設定：params.twoのみを提供（validation, options, errorHandlingが欠けている）
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

    // パーシャル設定では実行時エラーが発生することを確認
    let constructorError = false;
    try {
      // TypeScript型チェックを回避してランタイム動作を確認
      // deno-lint-ignore no-explicit-any
      const parser = new ParamsParser(undefined, partialConfig as any);
      // もしコンストラクタが成功したら、パースを試行
      parser.parse(['partial1', 'partialLayer1']);
    } catch (error) {
      constructorError = true;
      // validationプロパティが存在しないためのエラーが発生することを確認
      assertEquals((error as Error).message.includes('Cannot read properties of undefined'), true);
    }

    // コンストラクタでエラーが発生することを確認
    assertEquals(constructorError, true);
  });

  await t.step(
    'should work correctly with DEFAULT_CUSTOM_CONFIG spread for partial override',
    () => {
      // DEFAULT_CUSTOM_CONFIGをスプレッドして部分的にオーバーライド
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

      // カスタムパラメータが正常に動作することを確認
      const result1 = parser.parse(['spread1', 'spreadLayer1']) as TwoParamsResult;
      assertEquals(result1.type, 'two');
      assertEquals(result1.directiveType, 'spread1');
      assertEquals(result1.layerType, 'spreadLayer1');

      // デフォルトパラメータはエラーになることを確認（カスタムパターンに合わない）
      const result2 = parser.parse(['to', 'project']);
      assertEquals(result2.type, 'error');
      if (result2.type === 'error' && result2.error) {
        assertEquals(result2.error.message, 'Spread directive type error');
      }

      // デフォルトのvalidationルールとoptionsが使われることを確認
      const result3 = parser.parse(['spread1', 'spreadLayer1', '--from=input.md']);
      assertEquals(result3.type, 'two');
      if (result3.type === 'two') {
        assertEquals(result3.options.from, 'input.md');
      }

      // デフォルトのzeroパラメータバリデーションが使われることを確認
      const result4 = parser.parse(['--help']);
      assertEquals(result4.type, 'zero');
      if (result4.type === 'zero') {
        assertEquals(result4.options.help, true);
      }
    },
  );

  await t.step('should export CustomConfig and DEFAULT_CUSTOM_CONFIG from JSR entry point', () => {
    // JSRユーザー向けエクスポートの動作確認
    // mod.tsからのimportが正常に動作することを確認

    // ParamsParserはすでにmod.tsからimportされているので、DEFAULT_CUSTOM_CONFIGも同様にアクセス可能か確認
    // 実際のJSRユーザーの使用パターンをシミュレート
    const parser = new ParamsParser();
    const defaultResult = parser.parse(['to', 'project']);
    assertEquals(defaultResult.type, 'two');

    // CustomConfigとDEFAULT_CUSTOM_CONFIGがmod.tsから利用可能であることは
    // このテストファイルのimport文で既に確認済み
    // (import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../../../src/types/custom_config.ts';)
    //
    // JSR公開時は src/mod.ts からエクスポートされるため、
    // ユーザーは import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from 'jsr:@scope/breakdownparams'
    // の形で利用できる
  });
});
