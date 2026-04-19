import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import {
  ALL_CATEGORIES,
  CATEGORY_PATTERNS,
  expandPolicy,
  resolveEffectivePolicy,
} from '../security_policy_resolver.ts';
import type { SecurityCategory } from '../../types/custom_config.ts';

Deno.test('resolver: ALL_CATEGORIES enumerates the five known categories in order', () => {
  assertEquals(ALL_CATEGORIES, [
    'shellInjection',
    'absolutePath',
    'homeExpansion',
    'parentTraversal',
    'specialChars',
  ]);
});

Deno.test('resolver: CATEGORY_PATTERNS has off=null for every category', () => {
  for (const cat of ALL_CATEGORIES) {
    assertEquals(
      CATEGORY_PATTERNS[cat].off,
      null,
      `${cat}.off must be null (no check)`,
    );
  }
});

Deno.test('resolver: CATEGORY_PATTERNS provides safe and strict regex for every category', () => {
  for (const cat of ALL_CATEGORIES) {
    const safe = CATEGORY_PATTERNS[cat].safe;
    const strict = CATEGORY_PATTERNS[cat].strict;
    assert(safe instanceof RegExp, `${cat}.safe must be RegExp`);
    assert(strict instanceof RegExp, `${cat}.strict must be RegExp`);
  }
});

Deno.test('resolver: expandPolicy(undefined, fallback) applies fallback to all', () => {
  const out = expandPolicy(undefined, 'safe');
  for (const cat of ALL_CATEGORIES) {
    assertEquals(out[cat], 'safe');
  }
});

Deno.test('resolver: expandPolicy(level) applies that level to every category', () => {
  const out = expandPolicy('strict', 'safe');
  for (const cat of ALL_CATEGORIES) {
    assertEquals(out[cat], 'strict');
  }
});

Deno.test('resolver: expandPolicy(partial map) fills missing categories with fallback', () => {
  const out = expandPolicy({ shellInjection: 'strict' }, 'safe');
  assertEquals(out.shellInjection, 'strict');
  assertEquals(out.absolutePath, 'safe');
  assertEquals(out.homeExpansion, 'safe');
  assertEquals(out.parentTraversal, 'safe');
  assertEquals(out.specialChars, 'safe');
});

Deno.test('resolver: resolveEffectivePolicy global=safe, no override, kind=path -> safe everywhere', () => {
  const out = resolveEffectivePolicy('safe', undefined, 'path');
  for (const cat of ALL_CATEGORIES) {
    assertEquals(out[cat], 'safe');
  }
});

Deno.test('resolver: resolveEffectivePolicy global=safe, no override, kind=text -> path categories off', () => {
  const out = resolveEffectivePolicy('safe', undefined, 'text');
  assertEquals(out.shellInjection, 'safe');
  const pathOnly: SecurityCategory[] = [
    'absolutePath',
    'homeExpansion',
    'parentTraversal',
    'specialChars',
  ];
  for (const cat of pathOnly) {
    assertEquals(out[cat], 'off', `${cat} must be off when kind!='path'`);
  }
});

Deno.test('resolver: per-option string policy overrides global for path-only categories', () => {
  const out = resolveEffectivePolicy('safe', 'off', 'path');
  for (const cat of ALL_CATEGORIES) {
    assertEquals(out[cat], 'off');
  }
});

Deno.test('resolver: per-option partial overrides only listed categories', () => {
  const out = resolveEffectivePolicy(
    'safe',
    { parentTraversal: 'off' },
    'path',
  );
  assertEquals(out.parentTraversal, 'off');
  assertEquals(out.absolutePath, 'safe');
  assertEquals(out.homeExpansion, 'safe');
  assertEquals(out.specialChars, 'safe');
  assertEquals(out.shellInjection, 'safe');
});

Deno.test('resolver: kind=text forces path-only categories off even after per-option override', () => {
  const out = resolveEffectivePolicy(
    'safe',
    { parentTraversal: 'strict' },
    'text',
  );
  // per-option set strict, but kind=text scopes path-only -> off
  assertEquals(out.parentTraversal, 'off');
  assertEquals(out.shellInjection, 'safe');
});

Deno.test('resolver: undefined kind treated as text (path-only categories off)', () => {
  const out = resolveEffectivePolicy('safe', undefined, undefined);
  assertEquals(out.parentTraversal, 'off');
  assertEquals(out.absolutePath, 'off');
});
