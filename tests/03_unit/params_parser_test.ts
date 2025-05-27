import { assert, assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../../src/core/params/processors/params_parser.ts';
import { ErrorCategory, ErrorCode } from '../../src/core/errors/types.ts';
import {
  OneParamResult,
  ParamPatternResult,
  ParseResult,
  TwoParamResult,
} from '../../src/core/params/definitions/types.ts';

function isOneParamResult(
  result: ParseResult<ParamPatternResult>,
): result is ParseResult<OneParamResult> {
  return result.success && result.data?.type === 'one';
}

function isTwoParamResult(
  result: ParseResult<ParamPatternResult>,
): result is ParseResult<TwoParamResult> {
  return result.success && result.data?.type === 'two';
}

Deno.test('ParamsParser', async (t) => {
  const parser = new ParamsParser();

  await t.step('should parse single param command', () => {
    const result = parser.parse(['init', '--from=test.txt']);
    assertExists(result);
    assert(isOneParamResult(result));
    assert(result.data);
    assertEquals(result.data.type, 'one');
    assertEquals(result.data.command, 'init');
    assertEquals(result.data.options.fromFile, 'test.txt');
  });

  await t.step('should parse double params command', () => {
    const result = parser.parse(['to', 'project', '--from=test.txt']);
    assertExists(result);
    assert(isTwoParamResult(result));
    assert(result.data);
    assertEquals(result.data.type, 'two');
    assertEquals(result.data.demonstrativeType, 'to');
    assertEquals(result.data.layerType, 'project');
    assertEquals(result.data.options.fromFile, 'test.txt');
  });

  await t.step('should handle security error', () => {
    console.log('Testing security error handling');
    const result = parser.parse(['init', '--from=test.txt;ls']);
    console.log('Parse result:', result);
    assertExists(result);
    console.log('Error code:', result.error?.code);
    console.log('Expected code:', ErrorCode.SECURITY_ERROR);
    assertEquals(result.error?.code, ErrorCode.SECURITY_ERROR);
    assertEquals(result.error?.category, ErrorCategory.SECURITY);
  });

  await t.step('should handle invalid command', () => {
    const result = parser.parse(['invalid', '--from=test.txt']);
    assertExists(result);
    assertEquals(result.error?.code, ErrorCode.VALIDATION_ERROR);
    assertEquals(result.error?.category, ErrorCategory.VALIDATION);
  });
});
