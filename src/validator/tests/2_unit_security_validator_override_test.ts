import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { SecurityValidator } from '../security_validator.ts';
import type { CustomConfig, OptionDefinition } from '../../types/custom_config.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';

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

interface Phase2Input {
  positionalParams: string[];
  resolvedOptions: Map<string, { value: string; rawArg: string; isUserVariable: boolean }>;
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

Deno.test('override: per-option strict on text-kind tightens shellInjection only', () => {
  // text-kind with per-option strict: path-only categories still scoped off,
  // but shellInjection is global (Phase 1) so this override has no effect at
  // Phase 2. Documented contract.
  const config = configWith({
    edition: {
      shortForm: 'e',
      description: 'edition',
      valueRequired: true,
      kind: 'text',
      securityPolicy: 'strict',
    },
  });
  const v = new SecurityValidator(config);
  // Phase 2 strict on text-kind has no enforced category (path categories
  // are forced off) — so even an absolute path passes Phase 2.
  const r = v.validatePhase2(makePhase2('edition', '/abs/path'));
  assert(r.isValid, 'text-kind never enforces path categories');
});

// --- per-option override relaxes path categories ---------------------------

Deno.test('override: per-option off relaxes parentTraversal on path-kind option', () => {
  const config = configWith({
    from: {
      shortForm: 'f',
      description: 'from',
      valueRequired: true,
      kind: 'path',
      securityPolicy: { parentTraversal: 'off' },
    },
  });
  const v = new SecurityValidator(config);
  const r = v.validatePhase2(makePhase2('from', '../sibling'));
  assert(r.isValid, 'parentTraversal disabled per option should accept ..');
});

Deno.test('override: per-option off on parentTraversal still leaves absolutePath safe', () => {
  const config = configWith({
    from: {
      shortForm: 'f',
      description: 'from',
      valueRequired: true,
      kind: 'path',
      securityPolicy: { parentTraversal: 'off' },
    },
  });
  const v = new SecurityValidator(config);
  const r = v.validatePhase2(makePhase2('from', '/abs/path'));
  assertFalse(r.isValid, 'absolutePath still safe');
  assertEquals(
    r.errorMessage,
    'Security error: absolutePath violation in option from',
  );
});

// --- scope: kind=text never gets path enforcement --------------------------

Deno.test('scope: text-kind value with absolute path passes (path categories off)', () => {
  // Default config: config option is text-kind. With safe policy globally,
  // an absolute path through --config still passes Phase 2.
  const v = new SecurityValidator(DEFAULT_CUSTOM_CONFIG);
  const input = {
    positionalParams: [],
    resolvedOptions: new Map([
      ['config', {
        value: '/etc/app.json',
        rawArg: '--config=/etc/app.json',
        isUserVariable: false,
      }],
    ]),
  };
  const r = v.validatePhase2(input);
  assert(r.isValid, 'text-kind config should not be path-checked');
});

// --- scope: --uv-* skipped in Phase 2 even if value looks dangerous --------

Deno.test('scope: --uv-* values are never path-checked in Phase 2', () => {
  const v = new SecurityValidator(DEFAULT_CUSTOM_CONFIG);
  const input = {
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
        from: {
          shortForm: 'f',
          description: 'from',
          valueRequired: true,
          kind: 'path',
          securityPolicy: 'off',
        },
      },
    },
    security: { policy: 'strict' },
  };
  const v = new SecurityValidator(config);
  const r = v.validatePhase2(makePhase2('from', '~/anything'));
  assert(r.isValid);
});

// --- partial map merges with global -----------------------------------------

Deno.test('override: per-option partial map only overrides listed categories', () => {
  const config = configWith({
    from: {
      shortForm: 'f',
      description: 'from',
      valueRequired: true,
      kind: 'path',
      securityPolicy: { homeExpansion: 'off' },
    },
  });
  const v = new SecurityValidator(config);
  // homeExpansion off
  const r1 = v.validatePhase2(makePhase2('from', '~/x'));
  assert(r1.isValid, 'homeExpansion override accepts ~/x');
  // parentTraversal still safe (global)
  const r2 = v.validatePhase2(makePhase2('from', '../x'));
  assertFalse(r2.isValid, 'parentTraversal still rejects ../x');
});
