import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { formatSecurityError, type Phase2Input, SecurityValidator } from '../security_validator.ts';
import type { CustomConfig, OptionDefinition } from '../../types/custom_config.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';

/**
 * @purpose Per-option `securityPolicy` override + `kind`-scoping behavior.
 * @intent Path-kind / text-kind option names are derived from
 *   DEFAULT_CUSTOM_CONFIG.options.values rather than hardcoded strings.
 *   Error messages are derived from {@link formatSecurityError}.
 */

const PATH_OPTION_NAME = pickOptionByKind('path');
const TEXT_OPTION_NAME = pickOptionByKind('text');

assert(PATH_OPTION_NAME.length > 0, 'No path-kind option in DEFAULT_CUSTOM_CONFIG.options.values');
assert(TEXT_OPTION_NAME.length > 0, 'No text-kind option in DEFAULT_CUSTOM_CONFIG.options.values');

function pickOptionByKind(kind: 'path' | 'text'): string {
  for (const [name, def] of Object.entries(DEFAULT_CUSTOM_CONFIG.options.values)) {
    if ((def as OptionDefinition).kind === kind) return name;
  }
  return '';
}

function configWith(values: Record<string, OptionDefinition>): CustomConfig {
  return {
    ...DEFAULT_CUSTOM_CONFIG,
    options: {
      ...DEFAULT_CUSTOM_CONFIG.options,
      values,
    },
    security: { policy: 'safe' },
  };
}

function makePhase2(name: string, value: string, isUv = false): Phase2Input {
  return {
    positionalParams: [],
    resolvedOptions: new Map([
      [name, { value, rawArg: `--${isUv ? 'uv-' : ''}${name}=${value}`, isUserVariable: isUv }],
    ]),
  };
}

// --- per-option override tightens (text → strict for shellInjection) -------

Deno.test('override: per-option strict on text-kind has no Phase 2 effect (path categories scoped off)', () => {
  // Documented contract: text-kind never enforces path categories regardless
  // of override. Phase 1 (shellInjection) is global, not per-option.
  const config = configWith({
    [TEXT_OPTION_NAME]: {
      ...DEFAULT_CUSTOM_CONFIG.options.values[TEXT_OPTION_NAME],
      securityPolicy: 'strict',
    },
  });
  const v = new SecurityValidator(config);
  const r = v.validatePhase2(makePhase2(TEXT_OPTION_NAME, '/abs/path'));
  assert(r.isValid, `text-kind '${TEXT_OPTION_NAME}' must never enforce path categories`);
});

// --- per-option override relaxes path categories ---------------------------

Deno.test('override: per-option off relaxes parentTraversal on path-kind option', () => {
  const config = configWith({
    [PATH_OPTION_NAME]: {
      ...DEFAULT_CUSTOM_CONFIG.options.values[PATH_OPTION_NAME],
      securityPolicy: { parentTraversal: 'off' },
    },
  });
  const v = new SecurityValidator(config);
  const r = v.validatePhase2(makePhase2(PATH_OPTION_NAME, '../sibling'));
  assert(r.isValid, `parentTraversal disabled on '${PATH_OPTION_NAME}' should accept ..`);
});

Deno.test('override: per-option off on parentTraversal still leaves absolutePath safe', () => {
  const config = configWith({
    [PATH_OPTION_NAME]: {
      ...DEFAULT_CUSTOM_CONFIG.options.values[PATH_OPTION_NAME],
      securityPolicy: { parentTraversal: 'off' },
    },
  });
  const v = new SecurityValidator(config);
  const r = v.validatePhase2(makePhase2(PATH_OPTION_NAME, '/abs/path'));
  assertFalse(r.isValid, 'absolutePath must remain safe-level');
  assertEquals(
    r.errorMessage,
    formatSecurityError('absolutePath', `option ${PATH_OPTION_NAME}`),
  );
});

// --- scope: kind=text never gets path enforcement --------------------------

Deno.test('scope: text-kind value with absolute path passes (path categories off)', () => {
  // DEFAULT_CUSTOM_CONFIG: TEXT_OPTION_NAME is text-kind. With safe global,
  // an absolute path through that option still passes Phase 2.
  const v = new SecurityValidator(DEFAULT_CUSTOM_CONFIG);
  const input: Phase2Input = {
    positionalParams: [],
    resolvedOptions: new Map([
      [TEXT_OPTION_NAME, {
        value: '/etc/app.json',
        rawArg: `--${TEXT_OPTION_NAME}=/etc/app.json`,
        isUserVariable: false,
      }],
    ]),
  };
  const r = v.validatePhase2(input);
  assert(r.isValid, `text-kind '${TEXT_OPTION_NAME}' should not be path-checked`);
});

// --- scope: --uv-* skipped in Phase 2 even if value looks dangerous --------

Deno.test('scope: --uv-* values are never path-checked in Phase 2', () => {
  const v = new SecurityValidator(DEFAULT_CUSTOM_CONFIG);
  const input: Phase2Input = {
    positionalParams: [],
    resolvedOptions: new Map([
      ['uv-x', { value: '../etc', rawArg: '--uv-x=../etc', isUserVariable: true }],
    ]),
  };
  const r = v.validatePhase2(input);
  assert(r.isValid, 'uv option must be skipped in Phase 2');
});

// --- global strict + per-option off ----------------------------------------

Deno.test('override: global strict + per-option off disables all path enforcement', () => {
  const config: CustomConfig = {
    ...DEFAULT_CUSTOM_CONFIG,
    options: {
      ...DEFAULT_CUSTOM_CONFIG.options,
      values: {
        ...DEFAULT_CUSTOM_CONFIG.options.values,
        [PATH_OPTION_NAME]: {
          ...DEFAULT_CUSTOM_CONFIG.options.values[PATH_OPTION_NAME],
          securityPolicy: 'off',
        },
      },
    },
    security: { policy: 'strict' },
  };
  const v = new SecurityValidator(config);
  const r = v.validatePhase2(makePhase2(PATH_OPTION_NAME, '~/anything'));
  assert(r.isValid);
});

// --- partial map merges with global -----------------------------------------

Deno.test('override: per-option partial map only overrides listed categories', () => {
  const config = configWith({
    [PATH_OPTION_NAME]: {
      ...DEFAULT_CUSTOM_CONFIG.options.values[PATH_OPTION_NAME],
      securityPolicy: { homeExpansion: 'off' },
    },
  });
  const v = new SecurityValidator(config);
  // homeExpansion off
  const r1 = v.validatePhase2(makePhase2(PATH_OPTION_NAME, '~/x'));
  assert(r1.isValid, 'homeExpansion override accepts ~/x');
  // parentTraversal still safe (global)
  const r2 = v.validatePhase2(makePhase2(PATH_OPTION_NAME, '../x'));
  assertFalse(r2.isValid, 'parentTraversal still rejects ../x');
  assertEquals(
    r2.errorMessage,
    formatSecurityError('parentTraversal', `option ${PATH_OPTION_NAME}`),
  );
});
