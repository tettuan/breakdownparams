import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../security_validator.ts';

const logger = new BreakdownLogger('security-phase1');

// Phase 1 (v1.2.3) Issue #42 対応の受け入れ基準テスト
// docs/development.ja.md, docs/errors.ja.md, docs/user_variable_options.ja.md
// に基づく、新仕様の網羅テスト。
//
// 修正の趣旨:
//   1. path traversal regex を /\.\.[\/\\]|\.\.$/ に厳密化
//      （`...`、`..README`、`..foo` の誤検知を解消）
//   2. path traversal 検査の前段で `--uv-*` を除外
//      （shell injection 検査は全引数で維持）

Deno.test('phase1: --uv-* に ellipsis を含む値は通る', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['--uv-summary=truncated text...']);
  logger.debug('uv ellipsis', { data: result });
  assert(result.isValid, '--uv-* の ellipsis 値は通るべき');
});

Deno.test('phase1: --uv-* に narrative ..end を含む値は通る', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['--uv-note=see section ..end']);
  logger.debug('uv narrative', { data: result });
  assert(result.isValid, '--uv-* の narrative 値は通るべき');
});

Deno.test('phase1: --uv-* に ..README を含む値は通る', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['--uv-x=...README']);
  logger.debug('uv ..README', { data: result });
  assert(result.isValid, '--uv-* の ...README 値は通るべき');
});

Deno.test('phase1: --uv-* に narrative ..text を含む値は通る', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['--uv-x=narrative ..text']);
  logger.debug('uv narrative ..text', { data: result });
  assert(result.isValid, '--uv-* の narrative ..text 値は通るべき');
});

Deno.test('phase1: ../etc/passwd は path traversal で拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['../etc/passwd']);
  logger.debug('../etc/passwd', { data: result });
  assertFalse(result.isValid, 'path traversal は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: Path traversal attempt detected',
  );
});

Deno.test('phase1: --config=../sibling は path traversal で拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['--config=../sibling']);
  logger.debug('--config=../sibling', { data: result });
  assertFalse(result.isValid, 'path traversal は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: Path traversal attempt detected',
  );
});

Deno.test('phase1: ..\\windows\\sys は path traversal で拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['..\\windows\\sys']);
  logger.debug('..\\windows\\sys', { data: result });
  assertFalse(result.isValid, 'バックスラッシュ path traversal は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: Path traversal attempt detected',
  );
});

Deno.test('phase1: 末尾 .. は path traversal で拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['foo/..']);
  logger.debug('foo/..', { data: result });
  assertFalse(result.isValid, '末尾 .. は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: Path traversal attempt detected',
  );
});

Deno.test('phase1: --uv-* でも shell injection は拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['--uv-x=evil; rm -rf /']);
  logger.debug('uv shell injection', { data: result });
  assertFalse(result.isValid, '--uv-* でも shell injection は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: Shell command execution or redirection attempt detected',
  );
});

Deno.test('phase1: 通常引数の shell injection は拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['normal_arg; ls']);
  logger.debug('normal shell injection', { data: result });
  assertFalse(result.isValid, '通常引数の shell injection は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: Shell command execution or redirection attempt detected',
  );
});

Deno.test('phase1: 通常の init --config=test は通る', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['init', '--config=test']);
  logger.debug('init --config=test', { data: result });
  assert(result.isValid, '通常引数は通るべき');
});

Deno.test('phase1: 通常の to project は通る', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['to', 'project']);
  logger.debug('to project', { data: result });
  assert(result.isValid, '通常引数は通るべき');
});

Deno.test('phase1: 通常引数の ..README は誤検知されず通る', () => {
  // ..README は末尾 .. ではなく `..` の後に英字が続く形なので、
  // 厳密化された regex (/\.\.[\/\\]|\.\.$/) にマッチしない。
  const validator = new SecurityValidator();
  const result = validator.validate(['..README']);
  logger.debug('..README only', { data: result });
  assert(result.isValid, '..README は通るべき');
});

Deno.test('phase1: 通常引数の section ..end は誤検知されず通る', () => {
  // ..end も同様に末尾 .. ではないため通る。
  const validator = new SecurityValidator();
  const result = validator.validate(['section ..end']);
  logger.debug('section ..end', { data: result });
  assert(result.isValid, 'section ..end は通るべき');
});

Deno.test('phase1: 通常引数の単独 ... は末尾 .. として拒否される', () => {
  // 仕様 (docs/errors.ja.md): 通常引数では「末尾の ..」も拒否対象。
  // 単独 ... は末尾2文字が .. のため拒否される。
  // ellipsis をそのまま通したいケースは --uv-* で渡すこと（例外扱い）。
  const validator = new SecurityValidator();
  const result = validator.validate(['...']);
  logger.debug('triple dot only', { data: result });
  assertFalse(result.isValid, '通常引数の単独 ... は末尾 .. として拒否されるべき');
});
