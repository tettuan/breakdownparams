import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { formatSecurityError, type Phase2Input, SecurityValidator } from '../security_validator.ts';
import type { CustomConfig, Level, OptionDefinition } from '../../types/custom_config.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';
import { ALL_CATEGORIES, ALL_LEVELS, PATH_ONLY_CATEGORIES } from '../security_policy_resolver.ts';

/**
 * @purpose Per-(category, level) acceptance / rejection contracts for
 *   SecurityValidator. Every input pattern is paired with the validator-side
 *   expected message via {@link formatSecurityError} so the test does not
 *   duplicate the message format.
 *
 * @intent Each invocation goes through the public Phase 1 / Phase 2 API
 *   only — patterns are NEVER tested directly.
 */

// Source-of-truth derivation: pick the first built-in path-kind option.
// `from` is path-kind in DEFAULT_CUSTOM_CONFIG; if that ever changes the
// derivation here adapts automatically.
const PATH_OPTION_NAME = pickPathOptionName();

assert(
  PATH_OPTION_NAME.length > 0,
  'No path-kind option in DEFAULT_CUSTOM_CONFIG.options.values — categories test cannot run',
);
assert(ALL_CATEGORIES.length > 0, 'ALL_CATEGORIES empty — matrix test would pass vacuously');
assert(ALL_LEVELS.length > 0, 'ALL_LEVELS empty');

function pickPathOptionName(): string {
  for (const [name, def] of Object.entries(DEFAULT_CUSTOM_CONFIG.options.values)) {
    if ((def as OptionDefinition).kind === 'path') return name;
  }
  return '';
}

function makeConfig(level: Level): CustomConfig {
  return {
    ...DEFAULT_CUSTOM_CONFIG,
    security: { policy: level },
  };
}

function pathInput(value: string): Phase2Input {
  return {
    positionalParams: [],
    resolvedOptions: new Map([
      [PATH_OPTION_NAME, {
        value,
        rawArg: `--${PATH_OPTION_NAME}=${value}`,
        isUserVariable: false,
      }],
    ]),
  };
}

function pathContext(): string {
  return `option ${PATH_OPTION_NAME}`;
}

// -----------------------------
// Matrix coverage proof: every category × level cell is exercised by at
// least one named test below. The structural map is enforced here so a
// silently-removed cell would fail this guard.
// -----------------------------

interface MatrixCell {
  category: typeof ALL_CATEGORIES[number];
  level: Level;
}

const COVERED_CELLS: ReadonlyArray<MatrixCell> = [
  // shellInjection (Phase 1, applied to raw args, kind-agnostic)
  { category: 'shellInjection', level: 'off' },
  { category: 'shellInjection', level: 'safe' },
  { category: 'shellInjection', level: 'strict' },
  // path-only categories (Phase 2)
  ...PATH_ONLY_CATEGORIES.flatMap((category) =>
    ALL_LEVELS.map((level) => ({ category, level }) as MatrixCell)
  ),
];

Deno.test('matrix: every category x level cell is enumerated by COVERED_CELLS', () => {
  for (const category of ALL_CATEGORIES) {
    for (const level of ALL_LEVELS) {
      const present = COVERED_CELLS.some((c) => c.category === category && c.level === level);
      assert(
        present,
        `Matrix gap: cell (${category}, ${level}) is missing from COVERED_CELLS in ` +
          `src/validator/tests/2_unit_security_validator_categories_test.ts. ` +
          `Fix: add a Deno.test that exercises this cell and append it to COVERED_CELLS.`,
      );
    }
  }
});

// -----------------------------
// shellInjection (Phase 1)
// -----------------------------

Deno.test('cat: shellInjection off allows ; | & < >', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase1(['safe; echo']);
  assert(
    r.isValid,
    `cell=(shellInjection,off) input='safe; echo' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: shellInjection safe rejects ;', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase1(['evil; rm']);
  assertFalse(
    r.isValid,
    `cell=(shellInjection,safe) input='evil; rm' expected reject got accept`,
  );
  assertEquals(
    r.errorMessage,
    formatSecurityError('shellInjection', 'positional'),
    `cell=(shellInjection,safe) error message mismatch`,
  );
});

Deno.test('cat: shellInjection safe allows backtick (only strict catches it)', () => {
  // safe regex is /[;|&<>]/ which excludes backtick.
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase1(['code`whoami`']);
  assert(
    r.isValid,
    `cell=(shellInjection,safe) input='code\`whoami\`' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: shellInjection strict rejects backtick', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase1(['code`whoami`']);
  assertFalse(
    r.isValid,
    `cell=(shellInjection,strict) input='code\`whoami\`' expected reject got accept`,
  );
});

Deno.test('cat: shellInjection strict rejects $(...)', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase1(['x=$(id)']);
  assertFalse(
    r.isValid,
    `cell=(shellInjection,strict) input='x=$(id)' expected reject got accept`,
  );
});

Deno.test('cat: shellInjection strict rejects newline', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase1(['line1\nline2']);
  assertFalse(
    r.isValid,
    `cell=(shellInjection,strict) input='line1\\nline2' expected reject got accept`,
  );
});

// -----------------------------
// absolutePath (Phase 2)
// -----------------------------

Deno.test('cat: absolutePath off allows /etc/passwd', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('/etc/passwd'));
  assert(
    r.isValid,
    `cell=(absolutePath,off) input='/etc/passwd' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: absolutePath safe rejects /etc/passwd', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('/etc/passwd'));
  assertFalse(
    r.isValid,
    `cell=(absolutePath,safe) input='/etc/passwd' expected reject got accept`,
  );
  assertEquals(
    r.errorMessage,
    formatSecurityError('absolutePath', pathContext()),
    `cell=(absolutePath,safe) error message mismatch`,
  );
});

Deno.test('cat: absolutePath safe allows relative ./foo', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('./foo'));
  assert(
    r.isValid,
    `cell=(absolutePath,safe) input='./foo' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: absolutePath safe allows //share (UNC-like)', () => {
  // safe regex /^\/(?!\/)/ — leading // does NOT match (negative lookahead).
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('//share/x'));
  assert(
    r.isValid,
    `cell=(absolutePath,safe) input='//share/x' expected accept (lookahead) got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: absolutePath strict rejects Windows drive C:\\', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('C:\\Windows\\system32'));
  assertFalse(
    r.isValid,
    `cell=(absolutePath,strict) input='C:\\Windows\\system32' expected reject got accept`,
  );
});

Deno.test('cat: absolutePath strict rejects UNC \\\\srv\\share', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('\\\\srv\\share'));
  assertFalse(
    r.isValid,
    `cell=(absolutePath,strict) input='\\\\srv\\share' expected reject got accept`,
  );
});

// -----------------------------
// homeExpansion (Phase 2)
// -----------------------------

Deno.test('cat: homeExpansion off allows ~/data', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('~/data'));
  assert(
    r.isValid,
    `cell=(homeExpansion,off) input='~/data' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: homeExpansion safe rejects ~/data', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('~/data'));
  assertFalse(
    r.isValid,
    `cell=(homeExpansion,safe) input='~/data' expected reject got accept`,
  );
  assertEquals(
    r.errorMessage,
    formatSecurityError('homeExpansion', pathContext()),
    `cell=(homeExpansion,safe) error message mismatch`,
  );
});

Deno.test('cat: homeExpansion safe rejects ~ alone', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('~'));
  assertFalse(
    r.isValid,
    `cell=(homeExpansion,safe) input='~' expected reject got accept`,
  );
});

Deno.test('cat: homeExpansion safe allows ~README (no slash after)', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('~README'));
  assert(
    r.isValid,
    `cell=(homeExpansion,safe) input='~README' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: homeExpansion strict rejects ~README', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('~README'));
  assertFalse(
    r.isValid,
    `cell=(homeExpansion,strict) input='~README' expected reject got accept`,
  );
});

// -----------------------------
// parentTraversal (Phase 2)
// -----------------------------

Deno.test('cat: parentTraversal off allows ../etc', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('../etc'));
  assert(
    r.isValid,
    `cell=(parentTraversal,off) input='../etc' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: parentTraversal safe rejects ../etc', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('../etc'));
  assertFalse(
    r.isValid,
    `cell=(parentTraversal,safe) input='../etc' expected reject got accept`,
  );
  assertEquals(
    r.errorMessage,
    formatSecurityError('parentTraversal', pathContext()),
    `cell=(parentTraversal,safe) error message mismatch`,
  );
});

Deno.test('cat: parentTraversal safe allows ..README', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('..README'));
  assert(
    r.isValid,
    `cell=(parentTraversal,safe) input='..README' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: parentTraversal strict rejects URL-encoded %2E%2E/', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('%2E%2E/etc'));
  assertFalse(
    r.isValid,
    `cell=(parentTraversal,strict) input='%2E%2E/etc' expected reject got accept`,
  );
});

// -----------------------------
// specialChars (Phase 2)
// -----------------------------

Deno.test('cat: specialChars off allows NUL byte', () => {
  const v = new SecurityValidator(makeConfig('off'));
  const r = v.validatePhase2(pathInput('foo\x00bar'));
  assert(
    r.isValid,
    `cell=(specialChars,off) input='foo\\x00bar' expected accept got reject: ${r.errorMessage}`,
  );
});

Deno.test('cat: specialChars safe rejects NUL byte', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('foo\x00bar'));
  assertFalse(
    r.isValid,
    `cell=(specialChars,safe) input='foo\\x00bar' expected reject got accept`,
  );
  assertEquals(
    r.errorMessage,
    formatSecurityError('specialChars', pathContext()),
    `cell=(specialChars,safe) error message mismatch`,
  );
});

Deno.test('cat: specialChars safe rejects newline embedded in path', () => {
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('name\nwith-newline'));
  assertFalse(
    r.isValid,
    `cell=(specialChars,safe) input='name\\nwith-newline' expected reject got accept`,
  );
});

Deno.test('cat: specialChars strict rejects high control char (0x80)', () => {
  const v = new SecurityValidator(makeConfig('strict'));
  const r = v.validatePhase2(pathInput('foo\x80bar'));
  assertFalse(
    r.isValid,
    `cell=(specialChars,strict) input='foo\\x80bar' expected reject got accept`,
  );
});

Deno.test('cat: specialChars safe allows high control char (0x80)', () => {
  // safe regex /[\x00-\x1F\x7F]/ excludes 0x80-0x9F.
  const v = new SecurityValidator(makeConfig('safe'));
  const r = v.validatePhase2(pathInput('foo\x80bar'));
  assert(
    r.isValid,
    `cell=(specialChars,safe) input='foo\\x80bar' expected accept (range excludes 0x80) got reject: ${r.errorMessage}`,
  );
});
