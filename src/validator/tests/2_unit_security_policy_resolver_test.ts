import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import {
  ALL_CATEGORIES,
  ALL_LEVELS,
  CATEGORY_PATTERNS,
  expandPolicy,
  PATH_ONLY_CATEGORIES,
  resolveEffectivePolicy,
} from '../security_policy_resolver.ts';
import type { Level, SecurityCategory } from '../../types/custom_config.ts';

/**
 * @purpose Resolver-level invariants for SecurityPolicy expansion / merging.
 * @intent Every expected value derived from ALL_CATEGORIES / ALL_LEVELS /
 *   PATH_ONLY_CATEGORIES so the test does not duplicate the type union.
 */

// Non-vacuity guards: if any of these collections is empty the per-category
// loops below would silently pass and lie about coverage.
assert(
  ALL_CATEGORIES.length > 0,
  'ALL_CATEGORIES is empty — resolver tests would pass vacuously',
);
assert(ALL_LEVELS.length > 0, 'ALL_LEVELS is empty — level coverage tests would pass vacuously');
assert(PATH_ONLY_CATEGORIES.length > 0, 'PATH_ONLY_CATEGORIES is empty');

Deno.test('resolver: ALL_CATEGORIES covers every SecurityCategory union member', () => {
  // Type-level proof: the union literal type SecurityCategory must be
  // exhaustively enumerated by ALL_CATEGORIES. We rely on a static const
  // that enumerates the union and then ensure no member appears twice and
  // none is missing relative to PATH_ONLY_CATEGORIES + 'shellInjection'.
  const knownNonPath: SecurityCategory[] = ['shellInjection'];
  const expectedSet = new Set<SecurityCategory>([...PATH_ONLY_CATEGORIES, ...knownNonPath]);
  const actualSet = new Set<SecurityCategory>(ALL_CATEGORIES);
  assertEquals(
    actualSet.size,
    ALL_CATEGORIES.length,
    `ALL_CATEGORIES contains duplicates: ${ALL_CATEGORIES.join(', ')}. ` +
      `Fix: src/validator/security_policy_resolver.ts ALL_CATEGORIES.`,
  );
  assertEquals(
    actualSet,
    expectedSet,
    `ALL_CATEGORIES disagrees with PATH_ONLY_CATEGORIES + non-path categories. ` +
      `actual=[${[...actualSet].join(', ')}] expected=[${[...expectedSet].join(', ')}]. ` +
      `Fix: keep both arrays in sync in src/validator/security_policy_resolver.ts.`,
  );
});

Deno.test('resolver: CATEGORY_PATTERNS has off=null for every category', () => {
  for (const cat of ALL_CATEGORIES) {
    assertEquals(
      CATEGORY_PATTERNS[cat].off,
      null,
      `Category "${cat}" off-pattern must be null (no check). ` +
        `Fix: src/validator/security_policy_resolver.ts CATEGORY_PATTERNS.${cat}.off.`,
    );
  }
});

Deno.test('resolver: CATEGORY_PATTERNS provides RegExp for safe and strict on every category', () => {
  // Levels other than 'off' must yield a real RegExp.
  const enforcingLevels: Level[] = ALL_LEVELS.filter((l) => l !== 'off');
  for (const cat of ALL_CATEGORIES) {
    for (const level of enforcingLevels) {
      const pattern = CATEGORY_PATTERNS[cat][level];
      assert(
        pattern instanceof RegExp,
        `CATEGORY_PATTERNS.${cat}.${level} must be a RegExp, got ${pattern}. ` +
          `Fix: src/validator/security_policy_resolver.ts.`,
      );
    }
  }
});

Deno.test('resolver: expandPolicy(undefined, fallback) applies fallback to all', () => {
  for (const fallback of ALL_LEVELS) {
    const out = expandPolicy(undefined, fallback);
    for (const cat of ALL_CATEGORIES) {
      assertEquals(
        out[cat],
        fallback,
        `expandPolicy(undefined, '${fallback}') must set ${cat}=${fallback}, got ${out[cat]}.`,
      );
    }
  }
});

Deno.test('resolver: expandPolicy(level) applies that level to every category', () => {
  for (const level of ALL_LEVELS) {
    const out = expandPolicy(level, 'safe');
    for (const cat of ALL_CATEGORIES) {
      assertEquals(
        out[cat],
        level,
        `expandPolicy('${level}', 'safe') must set ${cat}=${level}, got ${out[cat]}.`,
      );
    }
  }
});

Deno.test('resolver: expandPolicy(partial map) fills missing categories with fallback', () => {
  const FALLBACK: Level = 'safe';
  const OVERRIDE: Level = 'strict';
  // Override exactly one category; the rest must equal FALLBACK.
  for (const target of ALL_CATEGORIES) {
    const out = expandPolicy({ [target]: OVERRIDE }, FALLBACK);
    assertEquals(
      out[target],
      OVERRIDE,
      `expandPolicy partial: target ${target} must be ${OVERRIDE}, got ${out[target]}.`,
    );
    for (const other of ALL_CATEGORIES) {
      if (other === target) continue;
      assertEquals(
        out[other],
        FALLBACK,
        `expandPolicy partial: non-target ${other} must fall back to ${FALLBACK}, got ${
          out[other]
        }.`,
      );
    }
  }
});

Deno.test('resolver: resolveEffectivePolicy global=safe, no override, kind=path -> safe everywhere', () => {
  const out = resolveEffectivePolicy('safe', undefined, 'path');
  for (const cat of ALL_CATEGORIES) {
    assertEquals(
      out[cat],
      'safe',
      `kind=path must keep all categories at global level. ${cat}=${out[cat]}.`,
    );
  }
});

Deno.test('resolver: resolveEffectivePolicy kind=text forces every PATH_ONLY_CATEGORY off', () => {
  const out = resolveEffectivePolicy('safe', undefined, 'text');
  // shellInjection (the only non-path category) keeps the global level.
  for (const cat of ALL_CATEGORIES) {
    if (PATH_ONLY_CATEGORIES.includes(cat)) {
      assertEquals(
        out[cat],
        'off',
        `Path-only category ${cat} must be off when kind!='path', got ${out[cat]}.`,
      );
    } else {
      assertEquals(
        out[cat],
        'safe',
        `Non-path category ${cat} must keep global level, got ${out[cat]}.`,
      );
    }
  }
});

Deno.test('resolver: per-option string policy overrides global for every category (kind=path)', () => {
  for (const override of ALL_LEVELS) {
    const out = resolveEffectivePolicy('safe', override, 'path');
    for (const cat of ALL_CATEGORIES) {
      assertEquals(
        out[cat],
        override,
        `per-option '${override}' must override every category. ${cat}=${out[cat]}.`,
      );
    }
  }
});

Deno.test('resolver: per-option partial overrides only listed categories', () => {
  const GLOBAL: Level = 'safe';
  const OVERRIDE: Level = 'off';
  for (const target of PATH_ONLY_CATEGORIES) {
    const out = resolveEffectivePolicy(GLOBAL, { [target]: OVERRIDE }, 'path');
    assertEquals(out[target], OVERRIDE, `partial override on ${target} must apply`);
    for (const other of ALL_CATEGORIES) {
      if (other === target) continue;
      assertEquals(
        out[other],
        GLOBAL,
        `unlisted ${other} must keep global ${GLOBAL}, got ${out[other]}.`,
      );
    }
  }
});

Deno.test('resolver: kind=text forces path-only off even when per-option override sets strict', () => {
  for (const target of PATH_ONLY_CATEGORIES) {
    const out = resolveEffectivePolicy('safe', { [target]: 'strict' }, 'text');
    assertEquals(
      out[target],
      'off',
      `kind=text must override per-option strict on ${target}, got ${out[target]}.`,
    );
  }
});

Deno.test('resolver: undefined kind treated as text (path-only categories off)', () => {
  const out = resolveEffectivePolicy('safe', undefined, undefined);
  for (const cat of PATH_ONLY_CATEGORIES) {
    assertEquals(
      out[cat],
      'off',
      `undefined kind must scope path-only off. ${cat}=${out[cat]}.`,
    );
  }
});
