import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { ParamsParser } from './params_parser.ts';
import type { CustomConfig, OptionDefinition } from '../types/custom_config.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../types/custom_config.ts';
import type { ErrorResult, TwoParamsResult } from '../types/params_result.ts';
import { formatSecurityError } from '../validator/security_validator.ts';

/**
 * @purpose End-to-end ParamsParser tests for SecurityPolicy wiring.
 *
 * @intent Per-option `kind` and `securityPolicy` must be threaded from
 *   CustomConfig down to the validator. Path-kind / text-kind option names
 *   are derived from DEFAULT_CUSTOM_CONFIG.options.values rather than
 *   hardcoded strings; error messages come from {@link formatSecurityError}.
 */

const PATH_OPTION_NAMES = pickOptionsByKind('path');
const TEXT_OPTION_NAMES = pickOptionsByKind('text');

assert(PATH_OPTION_NAMES.length > 0, 'No path-kind option in DEFAULT_CUSTOM_CONFIG');
assert(TEXT_OPTION_NAMES.length > 0, 'No text-kind option in DEFAULT_CUSTOM_CONFIG');

// Pick the first of each kind so the tests adapt automatically when the
// default config changes which built-in options carry which kind.
const PATH_OPTION = PATH_OPTION_NAMES[0]; // typically 'from'
const SECOND_PATH_OPTION = PATH_OPTION_NAMES[1] ?? PATH_OPTION; // typically 'destination'
const TEXT_OPTION = TEXT_OPTION_NAMES[0]; // typically 'input'

function pickOptionsByKind(kind: 'path' | 'text'): string[] {
  const out: string[] = [];
  for (const [name, def] of Object.entries(DEFAULT_CUSTOM_CONFIG.options.values)) {
    if ((def as OptionDefinition).kind === kind) out.push(name);
  }
  return out;
}

Deno.test(`e2e: default config rejects --${PATH_OPTION}=/abs/path (absolutePath safe)`, () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(
    ['to', 'project', `--${PATH_OPTION}=/etc/passwd`],
  ) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(result.error?.code, 'SECURITY_ERROR');
  assertEquals(
    result.error?.message,
    formatSecurityError('absolutePath', `option ${PATH_OPTION}`),
  );
});

Deno.test(`e2e: default config rejects --${PATH_OPTION}=~/data (homeExpansion safe)`, () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(
    ['to', 'project', `--${PATH_OPTION}=~/data`],
  ) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    formatSecurityError('homeExpansion', `option ${PATH_OPTION}`),
  );
});

Deno.test(`e2e: default config allows --${TEXT_OPTION}=../sibling (text-kind bypasses path checks)`, () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(
    ['to', 'project', `--${TEXT_OPTION}=../sibling`],
  ) as TwoParamsResult;
  assertEquals(result.type, 'two', 'text-kind option bypasses path checks');
  // Note: ParamsParser may rename the canonical key (e.g. input -> edition).
  // Just ensure the two-params result was produced; specific key mapping is
  // covered by parser tests, not security tests.
});

Deno.test('e2e: default config allows positional ../layer (no kind on positionals)', () => {
  // Positional params have no kind, so Phase 2 does nothing for them.
  // The legacy positional traversal check no longer fires in v1.3.0 —
  // positionals only get Phase 1 shellInjection.
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(['../layer', 'project']);
  if (result.type === 'error') {
    assert(
      result.error?.code !== 'SECURITY_ERROR',
      'positional traversal must not trigger security error',
    );
  }
});

Deno.test(`e2e: default config rejects --${PATH_OPTION}=foo;rm (Phase 1 shellInjection)`, () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(
    ['to', 'project', `--${PATH_OPTION}=foo;rm`],
  ) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    formatSecurityError('shellInjection', `option ${PATH_OPTION}`),
  );
});

Deno.test(`e2e: per-option securityPolicy off relaxes parentTraversal on ${PATH_OPTION}`, () => {
  const config: CustomConfig = {
    ...DEFAULT_CUSTOM_CONFIG,
    options: {
      ...DEFAULT_CUSTOM_CONFIG.options,
      values: {
        ...DEFAULT_CUSTOM_CONFIG.options.values,
        [PATH_OPTION]: {
          ...DEFAULT_CUSTOM_CONFIG.options.values[PATH_OPTION],
          securityPolicy: { parentTraversal: 'off' },
        },
      },
    },
  };
  const parser = new ParamsParser(undefined, config);
  const result = parser.parse(
    ['to', 'project', `--${PATH_OPTION}=../sibling`],
  ) as TwoParamsResult;
  assertEquals(result.type, 'two');
  assertEquals((result.options as Record<string, unknown>)[PATH_OPTION], '../sibling');
});

Deno.test('e2e: global policy strict tightens shellInjection (rejects backtick on text-kind option)', () => {
  // Use a text-kind option (config) so only Phase 1 triggers — backtick is
  // a strict-only shellInjection pattern.
  const config: CustomConfig = {
    ...DEFAULT_CUSTOM_CONFIG,
    security: { policy: 'strict' },
  };
  const parser = new ParamsParser(undefined, config);
  const result = parser.parse(['to', 'project', '--config=`whoami`']) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    formatSecurityError('shellInjection', 'option config'),
  );
});

Deno.test(`e2e: global policy off disables every category (--${PATH_OPTION}=/abs;ok passes)`, () => {
  const config: CustomConfig = {
    ...DEFAULT_CUSTOM_CONFIG,
    security: { policy: 'off' },
  };
  const parser = new ParamsParser(undefined, config);
  const result = parser.parse(
    ['to', 'project', `--${PATH_OPTION}=/abs;ok`],
  ) as TwoParamsResult;
  assertEquals(result.type, 'two', 'all security disabled');
  assertEquals((result.options as Record<string, unknown>)[PATH_OPTION], '/abs;ok');
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
    formatSecurityError('shellInjection', 'argument'),
  );
});

Deno.test(`e2e: --${SECOND_PATH_OPTION}=/var/log rejected by absolutePath`, () => {
  const parser = new ParamsParser(undefined, DEFAULT_CUSTOM_CONFIG);
  const result = parser.parse(
    ['to', 'project', `--${SECOND_PATH_OPTION}=/var/log/x`],
  ) as ErrorResult;
  assertEquals(result.type, 'error');
  assertEquals(
    result.error?.message,
    formatSecurityError('absolutePath', `option ${SECOND_PATH_OPTION}`),
  );
});
