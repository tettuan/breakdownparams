import { assertEquals, assertExists } from 'jsr:@std/assert@1';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { ParamsParser } from '../../../src/mod.ts';
import type { OptionRule } from '../../../src/types/option_rule.ts';
import type { TwoParamsResult } from '../../../src/types/params_result.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../../src/types/custom_config.ts';

const logger = new BreakdownLogger('e2e');

Deno.test('test_examples_execution', async (t) => {
  await t.step('basic_usage example', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['to', 'project']) as TwoParamsResult;
    logger.debug('Basic usage parse result', { data: { type: result.type, directiveType: result.directiveType, layerType: result.layerType } });

    assertEquals(result.type, 'two');
    assertEquals(result.directiveType, 'to');
    assertEquals(result.layerType, 'project');
    assertEquals(result.options, {});
  });

  await t.step('options_usage example', () => {
    const parser = new ParamsParser();
    const result = parser.parse([
      'to',
      'project',
      '--from=input.md',
      '--destination=output.md',
      '--input=issue',
      '--adaptation=strict',
      '--uv-project=myproject',
      '--uv-version=1.0.0',
    ]) as TwoParamsResult;
    logger.debug('Options usage parse result', { data: { type: result.type, optionKeys: Object.keys(result.options) } });

    assertEquals(result.type, 'two');
    assertEquals(result.directiveType, 'to');
    assertEquals(result.layerType, 'project');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['edition']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });

  await t.step('config_usage example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      rules: {
        userVariables: [
          '--config',
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version',
        ],
        requiredOptions: [],
        valueTypes: ['string'],
      },
      errorHandling: {
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
      },
      flagOptions: {
        help: true,
        version: true,
      },
    };

    const parser = new ParamsParser(customConfig);
    const result = parser.parse([
      'to',
      'project',
      '--config=test',
      '--from=input.md',
      '--destination=output.md',
      '--input=issue',
      '--adaptation=strict',
      '--uv-project=myproject',
      '--uv-version=1.0.0',
    ]) as TwoParamsResult;

    assertEquals(result.type, 'two');
    assertEquals(result.directiveType, 'to');
    assertEquals(result.layerType, 'project');
    assertExists(result.options['config']);
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['edition']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });

  await t.step('user_variable_options_usage example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      rules: {
        userVariables: [
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version',
          '--uv-environment',
        ],
        requiredOptions: [],
        valueTypes: ['string'],
      },
      errorHandling: {
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
      },
      flagOptions: {
        help: true,
        version: true,
      },
    };

    const parser = new ParamsParser(customConfig);
    const result = parser.parse([
      'to',
      'project',
      '--from=input.md',
      '--destination=output.md',
      '--input=issue',
      '--adaptation=strict',
      '--uv-project=myproject',
      '--uv-version=1.0.0',
      '--uv-environment=production',
    ]) as TwoParamsResult;

    assertEquals(result.type, 'two');
    assertEquals(result.directiveType, 'to');
    assertEquals(result.layerType, 'project');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['edition']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
    assertExists(result.options['uv-environment']);
  });

  await t.step('extended_params_usage example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      rules: {
        userVariables: [
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version',
        ],
        requiredOptions: [],
        valueTypes: ['string'],
      },
      errorHandling: {
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
      },
      flagOptions: {
        help: true,
        version: true,
      },
    };

    const customParamsConfig = {
      directiveType: {
        pattern: '^(to|summary|defect|custom)$',
        errorMessage: 'Invalid directive type. Must be one of: to, summary, defect, custom',
      },
      layerType: {
        pattern: '^(project|issue|task|custom)$',
        errorMessage: 'Invalid layer type. Must be one of: project, issue, task, custom',
      },
    };

    const parser = new ParamsParser(customConfig, {
      ...DEFAULT_CUSTOM_CONFIG,
      params: {
        two: customParamsConfig,
      },
    });
    const result = parser.parse([
      'custom',
      'custom',
      '--from=input.md',
      '--destination=output.md',
      '--input=issue',
      '--adaptation=strict',
      '--uv-project=myproject',
      '--uv-version=1.0.0',
    ]) as TwoParamsResult;

    assertEquals(result.type, 'two');
    assertEquals(result.directiveType, 'custom');
    assertEquals(result.layerType, 'custom');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['edition']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });

  await t.step('error_handling example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      rules: {
        userVariables: [
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version',
        ],
        requiredOptions: [],
        valueTypes: ['string'],
      },
      errorHandling: {
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
      },
      flagOptions: {
        help: true,
        version: true,
      },
    };

    const parser = new ParamsParser(customConfig);
    const result = parser.parse([
      'to',
      'issue',
      '--from=input.md',
      '--destination=output.md',
      '--input=project',
      '--adaptation=strict',
      '--uv-project=myproject',
      '--uv-version=1.0.0',
    ]) as TwoParamsResult;

    assertEquals(result.type, 'two');
    assertEquals(result.directiveType, 'to');
    assertEquals(result.layerType, 'issue');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['edition']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });
});
