import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../../../src/mod.ts';
import { OptionRule, TwoParamResult } from "../../src/types/option_rule.ts"';

Deno.test('test_examples_execution', async (t) => {
  await t.step('basic_usage example', () => {
    const parser = new ParamsParser();
    const result = parser.parse(['to', 'project']) as TwoParamResult;

    assertEquals(result.type, 'two');
    assertEquals(result.demonstrativeType, 'to');
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
      '--uv-version=1.0.0'
    ]) as TwoParamResult;

    assertEquals(result.type, 'two');
    assertEquals(result.demonstrativeType, 'to');
    assertEquals(result.layerType, 'project');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['input']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });

  await t.step('config_usage example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      validation: {
        customVariables: [
          '--config',
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version'
        ],
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
        requiredOptions: [],
        valueTypes: ['string'],
      },
      flagOptions: {
        help: 'help',
        version: 'version',
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
      '--uv-version=1.0.0'
    ]) as TwoParamResult;

    assertEquals(result.type, 'two');
    assertEquals(result.demonstrativeType, 'to');
    assertEquals(result.layerType, 'project');
    assertExists(result.options['config']);
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['input']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });

  await t.step('custom_variable_options_usage example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      validation: {
        customVariables: [
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version',
          '--uv-environment'
        ],
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
        requiredOptions: [],
        valueTypes: ['string'],
      },
      flagOptions: {
        help: 'help',
        version: 'version',
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
      '--uv-environment=production'
    ]) as TwoParamResult;

    assertEquals(result.type, 'two');
    assertEquals(result.demonstrativeType, 'to');
    assertEquals(result.layerType, 'project');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['input']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
    assertExists(result.options['uv-environment']);
  });

  await t.step('extended_params_usage example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      validation: {
        customVariables: [
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version'
        ],
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
        requiredOptions: [],
        valueTypes: ['string'],
      },
      flagOptions: {
        help: 'help',
        version: 'version',
      },
    };

    const parser = new ParamsParser(customConfig);
    const result = parser.parse([
      'custom',
      'custom',
      '--from=input.md',
      '--destination=output.md',
      '--input=issue',
      '--adaptation=strict',
      '--uv-project=myproject',
      '--uv-version=1.0.0'
    ]) as TwoParamResult;

    assertEquals(result.type, 'two');
    assertEquals(result.demonstrativeType, 'custom');
    assertEquals(result.layerType, 'custom');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['input']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });

  await t.step('error_handling example', () => {
    const customConfig: OptionRule = {
      format: '--key=value',
      validation: {
        customVariables: [
          '--from',
          '--destination',
          '--input',
          '--adaptation',
          '--uv-project',
          '--uv-version'
        ],
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
        requiredOptions: [],
        valueTypes: ['string'],
      },
      flagOptions: {
        help: 'help',
        version: 'version',
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
      '--uv-version=1.0.0'
    ]) as TwoParamResult;

    assertEquals(result.type, 'two');
    assertEquals(result.demonstrativeType, 'to');
    assertEquals(result.layerType, 'issue');
    assertExists(result.options['from']);
    assertExists(result.options['destination']);
    assertExists(result.options['input']);
    assertExists(result.options['adaptation']);
    assertExists(result.options['uv-project']);
    assertExists(result.options['uv-version']);
  });
}); 