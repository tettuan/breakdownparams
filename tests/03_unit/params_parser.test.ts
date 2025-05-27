import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../../src/params_parser.ts';
import { OneParamResult, TwoParamResult, ZeroParamResult } from '../../src/core/params/types.ts';
import { ErrorCategory, ErrorCode } from '../../src/core/errors/types.ts';

Deno.test('ParamsParser - parse single param', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['init', '--fromFile=test.txt']);
  assertEquals(result.success, true);
  if (result.data) {
    const data = result.data as OneParamResult;
    assertEquals(data.type, 'one');
    assertEquals(data.command, 'init');
    assertEquals(data.options.fromFile, 'test.txt');
  }
});

Deno.test('ParamsParser - parse double params', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['to', 'project', '--fromFile=test.txt']);
  assertEquals(result.success, true);
  if (result.data) {
    const data = result.data as TwoParamResult;
    assertEquals(data.type, 'two');
    assertEquals(data.demonstrativeType, 'to');
    assertEquals(data.layerType, 'project');
    assertEquals(data.options.fromFile, 'test.txt');
  }
});

Deno.test('ParamsParser - parse zero params', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['--help']);
  assertEquals(result.success, true);
  if (result.data) {
    const data = result.data as ZeroParamResult;
    assertEquals(data.type, 'zero');
    assertEquals(data.help, true);
    assertEquals(data.version, false);
  }
});

Deno.test('ParamsParser - handle security error', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['init', ';ls']);
  assertEquals(result.success, false);
  assertExists(result.error);
  assertEquals(result.error.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.error.category, ErrorCategory.SECURITY);
});
