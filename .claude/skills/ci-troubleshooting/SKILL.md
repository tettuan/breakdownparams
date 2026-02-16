---
name: ci-troubleshooting
description: Use when encountering CI errors, JSR connection issues, 'deno task ci' failures, or sandbox-related build problems. Provides solutions for common CI issues.
allowed-tools: [Bash, Read, Edit, Grep, Glob]
---

# CI Troubleshooting

## CI Pipeline (deno task ci)

`deno task ci` runs these stages in order:

1. **check** - Type checking (`deno check`)
2. **test** - Run all tests in `tests/`
3. **fmt** - Format check (`deno fmt --check`)
4. **lint** - Lint check (`deno lint`)

## Network / Sandbox Issues

### JSR Connection Failed

```
error: JSR package manifest for '@std/path' failed to load.
Import 'https://jsr.io/@std/path/meta.json' failed.
```

**Solution**: Run with sandbox disabled if needed:

```typescript
Bash({
  command: "deno task ci",
  dangerouslyDisableSandbox: true,
})
```

## Lint Errors

### Common Rules and Fixes

| Rule | Error | Fix |
|------|-------|-----|
| `no-import-prefix` | Inline `jsr:`, `npm:`, `https:` in import | Use import map alias from deno.json |
| `no-console` | console.log in library code | Add `// deno-lint-ignore no-console` |
| `prefer-ascii` | Japanese in comments | Change to English |
| `no-await-in-loop` | await in for loop | Add ignore or refactor to Promise.all |
| `eqeqeq` | `!=` instead of `!==` | Use strict equality |
| `explicit-function-return-type` | Missing return type | Add `: ReturnType` |
| `ban-unused-ignore` | Unused lint ignore | Remove or adjust ignore list |

### no-import-prefix (重要)

**すべてのimportはdeno.jsonのimport mapエントリを使用する。**

```typescript
// NG: インラインimport
import { assertEquals } from "jsr:@std/assert@^1.0.11";
import { join } from "https://deno.land/std/path/mod.ts";

// OK: import mapエイリアス
import { assertEquals } from "@std/assert";
import { join } from "@std/path";
```

新しい依存を追加する場合は、まず `deno.json` の `imports` にエントリを追加してからコードで使用する。

### File-Level Lint Ignore

Add at top of file:

```typescript
// deno-lint-ignore-file no-console prefer-ascii
```

### Line-Level Lint Ignore

```typescript
// deno-lint-ignore no-console
console.log("Debug output");
```

## Test Failures

### Flaky Tests (Timing Issues)

**Problem**: Parallel execution with small delays

**Solution**: Sequential execution with adequate delay

```typescript
for (let i = 0; i < 10; i++) {
  ids.push(generateId());
  await new Promise((r) => setTimeout(r, 5));
}
```

### Type Errors in Tests

Check for:
- Missing type assertions (`as Type`)
- Incorrect mock implementations
- Outdated test fixtures after interface changes

## Format Errors

```bash
# Check without fixing
deno fmt --check

# Fix all
deno fmt
```

## Quick Debugging

```bash
# Type check only
deno check mod.ts

# Lint only
deno lint

# Single test file
deno test --allow-env --allow-write --allow-read tests/01_unit/01_core/01_prompt_manager_test.ts

# Verbose test output
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read 2>&1 | head -100
```

## Related Skills

- CI execution: `/local-ci`
- Release flow: `/release-procedure`
