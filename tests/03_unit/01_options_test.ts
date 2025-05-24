/**
 * Option Test Suite
 *
 * Purpose of this test file:
 * 1. Verify that long and short form options are handled correctly
 * 2. Validate that option combinations work as expected
 * 3. Confirm that option precedence is applied correctly
 * 4. Confirm that the config option is only available with DoubleParams
 *
 * Expected behavior:
 * - Long form options (--from, --destination, --input, --config) are handled correctly
 * - Short form options (-f, -o, -i, -c) are handled correctly
 * - Long form takes precedence over short form
 * - Option combinations are handled correctly
 * - The config option is only valid with DoubleParams
 *
 * Test case structure:
 * 1. Test long form options
 * 2. Test short form options
 * 3. Test option combinations
 * 4. Test option precedence
 * 5. Test config option constraints
 *
 * Notes:
 * - The order of options does not affect the result
 * - If the same option is specified multiple times, the last one is valid
 * - The config option is only available with DoubleParams
 */

import { assertEquals } from '@std/assert';
import { BreakdownLogger } from 'jsr:@tettuan/breakdownlogger';
import { ParamsParser } from '../../mod.ts';

// Initialize logger for testing
const _logger = new BreakdownLogger();

Deno.test('Options', async (t) => {
  const parser = new ParamsParser();

  await t.step('should handle long form options', () => {
    const result = parser.parse([
      'to',
      'project',
      '--from',
      'input.txt',
      '--destination',
      'output.txt',
      '--input',
      'issue',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
        fromLayerType: 'issue',
      });
    }
  });

  await t.step('should handle short form options', () => {
    const result = parser.parse([
      'to',
      'project',
      '-f',
      'input.txt',
      '-o',
      'output.txt',
      '-i',
      'issue',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
        fromLayerType: 'issue',
      });
    }
  });

  await t.step('should handle mixed form options', () => {
    const result = parser.parse([
      'to',
      'project',
      '--from',
      'input.txt',
      '-o',
      'output.txt',
      '--input',
      'issue',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'input.txt',
        destinationFile: 'output.txt',
        fromLayerType: 'issue',
      });
    }
  });

  await t.step('should prioritize long form over short form', () => {
    const result = parser.parse([
      'to',
      'project',
      '--from',
      'long.txt',
      '-f',
      'short.txt',
      '--destination',
      'long.txt',
      '-o',
      'short.txt',
      '--input',
      'project',
      '-i',
      'task',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        fromFile: 'long.txt',
        destinationFile: 'long.txt',
        fromLayerType: 'project',
      });
    }
  });

  await t.step('should handle config option in DoubleParams', () => {
    const result = parser.parse([
      'to',
      'project',
      '--config',
      'test',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        configFile: 'test',
      });
    }
  });

  await t.step('should handle config option with short form', () => {
    const result = parser.parse([
      'to',
      'project',
      '-c',
      'test',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        configFile: 'test',
      });
    }
  });

  await t.step('should ignore config option in NoParams', () => {
    const result = parser.parse([
      '--config',
      'test',
    ]);
    assertEquals(result.type, 'no-params');
    if (result.type === 'no-params') {
      assertEquals(result.help, false);
      assertEquals(result.version, false);
    }
  });

  await t.step('should ignore config option in SingleParam', () => {
    const result = parser.parse([
      'init',
      '--config',
      'test',
    ]);
    assertEquals(result.type, 'single');
    if (result.type === 'single') {
      assertEquals(result.command, 'init');
      assertEquals(result.options, {});
    }
  });

  await t.step('should prioritize long form config over short form', () => {
    const result = parser.parse([
      'to',
      'project',
      '--config',
      'long',
      '-c',
      'short',
    ]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, 'to');
      assertEquals(result.layerType, 'project');
      assertEquals(result.options, {
        configFile: 'long',
      });
    }
  });
});
