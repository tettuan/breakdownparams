import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../security_validator.ts';

const logger = new BreakdownLogger('security-phase1');

// Phase 1 (v1.2.3) Issue #42 受け入れ基準テスト（v1.3.0 で error message 形式更新）
//
// v1.3.0 変更点:
//   - error message が `'Security error: <category> violation in <context>'`
//     に統一された。
//   - 標準 `validate(args)`（CustomConfig 不指定）は Phase 1 (shellInjection)
//     と back-compat の parentTraversal を順に実行する。
//   - 詳細は design.md / CHANGELOG 参照。

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

Deno.test('phase1: ../etc/passwd は parentTraversal で拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['../etc/passwd']);
  logger.debug('../etc/passwd', { data: result });
  assertFalse(result.isValid, 'path traversal は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: parentTraversal violation in positional',
  );
});

Deno.test('phase1: --from=../sibling は parentTraversal で拒否される', () => {
  // v1.3.0: ParamsParser 経由なら config は text-kind で素通りだが、
  // ここは validator.validate() スタンドアロン経路。`--uv-` 以外の全引数に
  // back-compat parentTraversal が適用される。
  const validator = new SecurityValidator();
  const result = validator.validate(['--from=../sibling']);
  logger.debug('--from=../sibling', { data: result });
  assertFalse(result.isValid, 'path traversal は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: parentTraversal violation in option from',
  );
});

Deno.test('phase1: ..\\windows\\sys は parentTraversal で拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['..\\windows\\sys']);
  logger.debug('..\\windows\\sys', { data: result });
  assertFalse(result.isValid, 'バックスラッシュ path traversal は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: parentTraversal violation in positional',
  );
});

Deno.test('phase1: 末尾 .. は parentTraversal で拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['foo/..']);
  logger.debug('foo/..', { data: result });
  assertFalse(result.isValid, '末尾 .. は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: parentTraversal violation in positional',
  );
});

Deno.test('phase1: --uv-* でも shell injection は拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['--uv-x=evil; rm -rf /']);
  logger.debug('uv shell injection', { data: result });
  assertFalse(result.isValid, '--uv-* でも shell injection は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: shellInjection violation in argument',
  );
});

Deno.test('phase1: 通常引数の shell injection は拒否される', () => {
  const validator = new SecurityValidator();
  const result = validator.validate(['normal_arg; ls']);
  logger.debug('normal shell injection', { data: result });
  assertFalse(result.isValid, '通常引数の shell injection は拒否されるべき');
  assertEquals(
    result.errorMessage,
    'Security error: shellInjection violation in positional',
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
