import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { SecurityValidator } from '../security_validator.ts';
import type { CustomConfig, Level } from '../../types/custom_config.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';

// 5 category × 3 level matrix tests against SecurityValidator
//
// Phase 1 (shellInjection) is exercised via validatePhase1 with raw args.
// Phase 2 (4 path categories) is exercised via validatePhase2 with a
// resolved option (`from`, kind='path' by default).

function makeConfig(level: Level): CustomConfig {
  return {
    ...DEFAULT_CUSTOM_CONFIG,
    security: { policy: level },
  };
}

function pathInput(value: string): {
  positionalParams: string[];
  resolvedOptions: Map<string, { value: string; rawArg: string; isUserVariable: boolean }>;
} {
  return {
    positionalParams: [],
    resolvedOptions: new Map([
      ['from', { value, rawArg: `--from=${value}`, isUserVariable: false }],
    ]),
  };
}

// -----------------------------
// shellInjection
// -----------------------------

Deno.test('cat: shellInjection off allows ; | & < >', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase1(['safe; echo']);
  assert(r.isValid, 'off should allow shell metacharacters');
});

Deno.test('cat: shellInjection safe rejects ;', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase1(['evil; rm']);
  assertFalse(r.isValid);
  assertEquals(
    r.errorMessage,
    'Security error: shellInjection violation in positional',
  );
});

Deno.test('cat: shellInjection safe allows backtick', () => {
  // safe regex /[;|&<>]/ does not include backtick
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase1(['code`whoami`']);
  assert(r.isValid, 'safe should allow backtick (only strict catches it)');
});

Deno.test('cat: shellInjection strict rejects backtick', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase1(['code`whoami`']);
  assertFalse(r.isValid);
});

Deno.test('cat: shellInjection strict rejects $(...)', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase1(['x=$(id)']);
  assertFalse(r.isValid);
});

Deno.test('cat: shellInjection strict rejects newline', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase1(['line1\nline2']);
  assertFalse(r.isValid);
});

// -----------------------------
// absolutePath
// -----------------------------

Deno.test('cat: absolutePath off allows /etc/passwd', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('/etc/passwd'));
  assert(r.isValid);
});

Deno.test('cat: absolutePath safe rejects /etc/passwd', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('/etc/passwd'));
  assertFalse(r.isValid);
  assertEquals(
    r.errorMessage,
    'Security error: absolutePath violation in option from',
  );
});

Deno.test('cat: absolutePath safe allows relative ./foo', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('./foo'));
  assert(r.isValid);
});

Deno.test('cat: absolutePath safe allows //share (UNC-like)', () => {
  // safe regex is /^\/(?!\/)/ — leading // does NOT match (negative lookahead)
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('//share/x'));
  assert(r.isValid, 'safe should not match leading double slash');
});

Deno.test('cat: absolutePath strict rejects Windows drive C:\\', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('C:\\Windows\\system32'));
  assertFalse(r.isValid);
});

Deno.test('cat: absolutePath strict rejects UNC \\\\srv\\share', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('\\\\srv\\share'));
  assertFalse(r.isValid);
});

// -----------------------------
// homeExpansion
// -----------------------------

Deno.test('cat: homeExpansion off allows ~/data', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('~/data'));
  assert(r.isValid);
});

Deno.test('cat: homeExpansion safe rejects ~/data', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('~/data'));
  assertFalse(r.isValid);
  assertEquals(
    r.errorMessage,
    'Security error: homeExpansion violation in option from',
  );
});

Deno.test('cat: homeExpansion safe rejects ~ alone', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('~'));
  assertFalse(r.isValid);
});

Deno.test('cat: homeExpansion safe allows ~README (no slash after)', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('~README'));
  assert(r.isValid);
});

Deno.test('cat: homeExpansion strict rejects ~README', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('~README'));
  assertFalse(r.isValid);
});

// -----------------------------
// parentTraversal
// -----------------------------

Deno.test('cat: parentTraversal off allows ../etc', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('../etc'));
  assert(r.isValid);
});

Deno.test('cat: parentTraversal safe rejects ../etc', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('../etc'));
  assertFalse(r.isValid);
  assertEquals(
    r.errorMessage,
    'Security error: parentTraversal violation in option from',
  );
});

Deno.test('cat: parentTraversal safe allows ..README', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('..README'));
  assert(r.isValid);
});

Deno.test('cat: parentTraversal strict rejects URL-encoded %2E%2E/', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('%2E%2E/etc'));
  assertFalse(r.isValid);
});

// -----------------------------
// specialChars
// -----------------------------

Deno.test('cat: specialChars off allows NUL byte', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('foo\x00bar'));
  assert(r.isValid);
});

Deno.test('cat: specialChars safe rejects NUL byte', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('foo\x00bar'));
  assertFalse(r.isValid);
  assertEquals(
    r.errorMessage,
    'Security error: specialChars violation in option from',
  );
});

Deno.test('cat: specialChars safe rejects newline embedded in path', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('name\nwith-newline'));
  assertFalse(r.isValid);
});

Deno.test('cat: specialChars strict rejects high control char (0x80)', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('foo\x80bar'));
  assertFalse(r.isValid);
});

Deno.test('cat: specialChars safe allows high control char (0x80)', () => {
  // safe regex /[\x00-\x1F\x7F]/ does not include 0x80-0x9F
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('foo\x80bar'));
  assert(r.isValid);
});
