import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { ParamsParser } from './params_parser.ts';
import type { CustomConfig } from '../types/custom_config.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../types/custom_config.ts';
import type { ErrorResult, TwoParamsResult } from '../types/params_result.ts';

// End-to-end ParamsParser tests for SecurityPolicy wiring.
//
// These exercise the full Phase 1 + Phase 2 path with various CustomConfig
// security setups, ensuring per-option `kind` and `securityPolicy` are
// correctly threaded from CustomConfig down to the validator.

Deno.test('e2e: default config rejects --from=/abs/path (absolutePath safe)', () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['to', 'project', '--from=/etc/passwd']) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(result.error?.code, 'SECURITY_ERROR');
  assertEquals(
    result.error?.message,
    'Security error: absolutePath violation in option from',
  );
});

Deno.test('e2e: default config rejects --from=~/data (homeExpansion safe)', () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['to', 'project', '--from=~/data']) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    'Security error: homeExpansion violation in option from',
  );
});

Deno.test('e2e: default config allows --config=../sibling (config is text-kind)', () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['to', 'project', '--config=../sibling']) as TwoParamsResult;
  assertEquals(result.type, 'two', 'text-kind config bypasses path checks');
  assertEquals(result.options?.config, '../sibling');
});

Deno.test('e2e: default config allows positional ../layer (no kind on positionals)', () => {
  // Positional params have no kind, so Phase 2 does nothing for them.
  // But the legacy positional traversal check used to fire here. v1.3.0
  // intentionally drops that — positionals only get Phase 1 shellInjection.
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['../layer', 'project']);
  // positionals don't match directiveType pattern, so this surfaces as a
  // params validation error — but importantly, NOT a security error.
  if (result.type === 'error') {
    assert(
      result.error?.code !== 'SECURITY_ERROR',
      'positional traversal must not trigger security error',
    );
  }
});

Deno.test('e2e: default config rejects --from=foo;rm (Phase 1 shellInjection)', () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['to', 'project', '--from=foo;rm']) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    'Security error: shellInjection violation in option from',
  );
});

Deno.test('e2e: per-option securityPolicy off relaxes parentTraversal on from', () => {
  const config: CustomConfig = {
    ...DEFAULT_CUSTOM_CONFIG,
    options: {
      ...DEFAULT_CUSTOM_CONFIG.options,
      values: {
        ...DEFAULT_CUSTOM_CONFIG.options.values,
        from: {
          ...DEFAULT_CUSTOM_CONFIG.options.values.from,
          securityPolicy: { parentTraversal: 'off' },
        },
      },
    },
  };
  const parser = new ParamsParser(undefined, config);
  const result = parser.parse(['to', 'project', '--from=../sibling']) as TwoParamsResult;
  assertEquals(result.type, 'two');
  assertEquals(result.options?.from, '../sibling');
});

Deno.test('e2e: global policy strict tightens shellInjection (rejects backtick)', () => {
  const config: CustomConfig = {
    ...DEFAULT_CUSTOM_CONFIG,
    security: { policy: 'strict' },
  };
  const parser = new ParamsParser(undefined, config);
  const result = parser.parse(['to', 'project', '--config=`whoami`']) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    'Security error: shellInjection violation in option config',
  );
});

Deno.test('e2e: global policy off disables every category', () => {
  const config: CustomConfig = {
    ...DEFAULT_CUSTOM_CONFIG,
    security: { policy: 'off' },
  };
  const parser = new ParamsParser(undefined, config);
  // shellInjection off — ; is allowed (would normally explode). This is the
  // caller's explicit opt-out.
  const result = parser.parse(['to', 'project', '--from=/abs;ok']) as TwoParamsResult;
  assertEquals(result.type, 'two', 'all security disabled');
  assertEquals(result.options?.from, '/abs;ok');
});

Deno.test('e2e: --uv-x=../etc passes (uv values not path-checked)', () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['to', 'project', '--uv-x=../etc']) as TwoParamsResult;
  assertEquals(result.type, 'two');
  assertFalse('error' in result, 'should not produce error');
});

Deno.test('e2e: --uv-x=evil;rm rejected by Phase 1 shellInjection', () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['to', 'project', '--uv-x=evil;rm']) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    'Security error: shellInjection violation in argument',
  );
});

Deno.test('e2e: --destination=/var/log rejected by absolutePath', () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['to', 'project', '--destination=/var/log/x']) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    'Security error: absolutePath violation in option destination',
  );
});
