# Test Design Patterns — Implementation Reference (breakdownparams)

対象リポジトリ: breakdownparams (Deno + JSR)。テストは `Deno.test` + `@std/assert`。

## Contract Test

### Theory

From Consumer-Driven Contracts (Ian Robinson): the consumer declares what it needs, and the provider is tested against that declaration.

The key: **import the consumer's declaration**. Do not copy it into the test.

### Implementation

```typescript
// Source of truth: OptionType enum declared for parser consumption
import { OptionType } from "../../src/types/option_type.ts";
import { FlagOption } from "../../src/option-models/flag_option.ts";
import { ValueOption } from "../../src/option-models/value_option.ts";
import { UserVariableOption } from "../../src/option-models/user_variable_option.ts";
import { assert, assertEquals } from "@std/assert";

// Derived automatically — no manual list to maintain
const REQUIRED = Object.values(OptionType);

Deno.test("option-models cover every OptionType", () => {
  const handlers = new Map<OptionType, unknown>([
    [OptionType.FLAG, FlagOption],
    [OptionType.VALUE, ValueOption],
    [OptionType.USER_VARIABLE, UserVariableOption],
  ]);

  const missing = REQUIRED.filter((t) => !handlers.has(t));
  assertEquals(
    missing.length,
    0,
    `Fix: Add option-model class for OptionType [${missing.join(", ")}] ` +
      `under src/option-models/. ` +
      `These variants are declared in src/types/option_type.ts ` +
      `(consumed by ParamsParser).`,
  );
});
```

### Why import, not copy

```typescript
// BAD: manual list — if OptionType adds "POSITIONAL", this test won't catch the gap
const REQUIRED = ["flag", "value", "user_variable"];

// GOOD: derived from source — any change to OptionType automatically propagates
const REQUIRED = Object.values(OptionType);
```

The manual list is a synchronization point. It requires a human to remember to update the test when the source changes. `Object.values()` eliminates that dependency.

### Error message: single direction

Contract tests have one correct fix direction: the provider must conform to the consumer. The error message reflects this:

```
Fix: Add [X] to <provider-file>.
These values are required by <consumer-module>.
```

No IF/THEN needed — the consumer is authoritative.

---

## Conformance Test

### Theory

Two peer sources must agree, but neither is the sole authority. Either could have been intentionally changed.

### Implementation

```typescript
// DEFAULT_CUSTOM_CONFIG の DirectiveType 既定値と docs/glossary.md の記述を相互検証
import { DEFAULT_CUSTOM_CONFIG } from "../../src/types/custom_config.ts";
import { assert } from "@std/assert";

Deno.test("DirectiveType defaults match docs/glossary.md", async () => {
  const pattern = DEFAULT_CUSTOM_CONFIG.params.two.directiveType.pattern;
  const docsText = await Deno.readTextFile("docs/glossary.md");

  const DOCUMENTED = extractDirectiveTypesFromGlossary(docsText); // ["to","summary","defect"]
  const accepted = DOCUMENTED.filter((v) => new RegExp(pattern).test(v));
  const missing = DOCUMENTED.filter((v) => !accepted.includes(v));

  assert(
    missing.length === 0,
    `Mismatch: docs/glossary.md documents DirectiveType values [${missing.join(", ")}] ` +
      `not accepted by DEFAULT_CUSTOM_CONFIG pattern "${pattern}" ` +
      `(src/types/custom_config.ts). ` +
      `IF docs は正、実装を更新すべきなら ` +
        `THEN src/types/custom_config.ts の pattern を更新. ` +
      `IF 実装は正、docs が古いなら ` +
        `THEN docs/glossary.md と docs/params.md を更新.`,
  );
});
```

### Error message: IF/THEN branching

Conformance tests present both valid fix directions:

```
IF <intent A>, THEN <fix A>.
IF <intent B>, THEN <fix B>.
```

The developer chooses based on their intent. The test cannot know which side is "right" — only that they disagree.

---

## Invariant Test

### Theory

From Property-Based Testing (QuickCheck, Claessen & Hughes 2000): test a property that holds for all members, not a specific example.

### Implementation

```typescript
// Invariant: OptionRule.flagOptions に宣言された全 key は option_validator で
// FlagOption として認識される
import { assert } from "@std/assert";
import type { OptionRule } from "../../src/types/option_rule.ts";
import { OptionValidator } from "../../src/validator/options/option_validator.ts";

Deno.test("every flagOption key is classified as FLAG by validator", () => {
  const rule = buildMinimalOptionRule(); // テスト用 fixture
  const keys = Object.keys(rule.flagOptions);

  // Guard: non-vacuity
  assert(keys.length > 0, "flagOptions empty — test would pass vacuously");

  const validator = new OptionValidator(rule);
  for (const key of keys) {
    const result = validator.classify(`--${key}`);
    assertEquals(
      result.type,
      "flag",
      `OptionRule declares "${key}" as flag, ` +
        `but OptionValidator classifies it as "${result.type}". ` +
        `Fix: align src/validator/options/option_validator.ts with ` +
        `the rule interface in src/types/option_rule.ts.`,
    );
  }
});
```

### Non-vacuity guard

An invariant test over an empty collection always passes. This is a silent lie. Always assert the collection is non-empty:

```typescript
// BAD: if keys is empty, the loop never executes, test passes
for (const key of keys) { assert(valid(key)); }

// GOOD: explicit guard
assert(keys.length > 0, "flagOptions empty — check OptionRule fixture");
for (const key of keys) { assert(valid(key)); }
```

---

## Layered Verification

### Theory

Combine Contract + Conformance in layers when a system has both hard requirements (from code) and soft requirements (from config).

### Structure

```
Layer 1 (Contract):     OptionType enum → option-models / validators
                        "option-models must cover every OptionType"
                        Error: "Fix option-models"

Layer 2 (Conformance):  DEFAULT_CUSTOM_CONFIG ↔ docs/glossary.md / docs/params.md
                        "config defaults と docs の記述が一致"
                        Error: IF/THEN
```

### Why layering matters

Layer 1 catches the non-negotiable requirements first. If Layer 1 fails, Layer 2 results are meaningless. If Layer 1 passes but Layer 2 fails, the developer knows the issue is config-specific, not a system requirement violation.

---

## Validator Test

Four aspects — each with a minimal fixture mutated per test:

```typescript
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { OptionCombinationValidator } from
  "../../src/validator/options/option_combination_validator.ts";

// Acceptance: valid input passes
Deno.test("validator accepts valid option combination", () => {
  const validator = new OptionCombinationValidator(minimalRule());
  const result = validator.validate({ help: true });
  assertEquals(
    result.isValid,
    true,
    `Valid combination rejected: ${result.errors.map((e) => e.message).join(", ")}`,
  );
});

// Rejection: invalid input caught
Deno.test("validator rejects conflicting options", () => {
  const validator = new OptionCombinationValidator(minimalRule());
  const result = validator.validate({ help: true, version: true });
  assertEquals(result.isValid, false);
});

// Diagnosis: error message is actionable (What + How-to-fix)
Deno.test("validator error identifies the offending option name", () => {
  const validator = new OptionCombinationValidator(minimalRule());
  const result = validator.validate({ help: true, version: true });
  assertStringIncludes(result.errors[0].message, "help");
});

// Completeness: every design constraint has a validation rule
Deno.test("every constraint in docs/options.md has a validator rule", async () => {
  const DESIGN_CONSTRAINTS = await readConstraintsFromDocs("docs/options.md");
  assert(DESIGN_CONSTRAINTS.length > 0, "No constraints parsed — fix extractor");
  for (const c of DESIGN_CONSTRAINTS) {
    const violated = applyConstraint(c);
    const result = new OptionCombinationValidator(minimalRule()).validate(violated);
    assertEquals(
      result.isValid,
      false,
      `No validation for design constraint "${c.id}". ` +
        `Fix: add rule in src/validator/options/option_combination_validator.ts.`,
    );
  }
});
```

---

## Anti-Pattern: Validator Bypass

Test checks config directly when a validator exists, creating two verification paths that diverge.

```typescript
// BAD: test reimplements validator's rule (stale if validator changes)
assertMatch(customConfig.params.two.directiveType.pattern, /to|summary|defect/);

// GOOD: test delegates to validator
const result = new TwoParamsValidator(customConfig).validate(["to", "project"]);
assertEquals(result.isValid, true);
```

Detection:

```
grep -rn "assertMatch.*\.pattern\b" tests/ src/**/tests/ --include="*_test.ts" | grep -v validate
```

breakdownparams では以下の validator を経由すべき:

- `src/validator/options/option_validator.ts`
- `src/validator/options/option_combination_validator.ts`
- `src/validator/options/user_variable_option_validator.ts`
- `src/validator/params/zero_params_validator.ts`
- `src/validator/params/one_param_validator.ts`
- `src/validator/params/two_params_validator.ts`
- `src/validator/security_validator.ts`

---

## Deriving Expected Values

### Decision table

| Source | Derivation Method | Example |
|--------|-------------------|---------|
| TypeScript enum | `import` + `Object.values()` | `OptionType` |
| Type literal union | 明示 const + 型宣言で網羅検査 | `ParamsResult["type"]` |
| JSON / YAML config | `JSON.parse` / YAML パース | n/a (当リポジトリは TS 宣言が中心) |
| Default config const | `DEFAULT_CUSTOM_CONFIG` | DirectiveType / LayerType pattern |
| Directory structure | `Glob` / `readDir` | `src/option-models/*.ts` |
| Design document | 抽出関数 + `@design_ref` | `docs/glossary.md`, `docs/options.md` |

### Rule: one degree of separation

The test should be **at most one step** from the source of truth:

```
Source → Test expectation     ✓  (import, parse)
Source → Copy → Test          ✗  (manual sync point)
Source → Summary → Test       ✗  (lossy translation)
```

---

## Diagnosability

### Theory

**Diagnosability** (診断可能性): a test failure is diagnosable if the failure message alone is sufficient to identify the fix.

- Gerard Meszaros『xUnit Test Patterns』(2007): **Defect Localization** — テストの粒度・命名・エラーメッセージの質が、障害箇所特定の速度を決定する
- Microsoft Research: テスト失敗の診断コスト研究 — メッセージだけで修正先が分かるテストは、デバッガやログ調査を不要にする

### Key insight: test pattern determines message structure

テストパターンの選択がエラーメッセージの構造まで決定する。これは設計段階で決まる:

| Test Pattern | Fault Type | Root Cause | Message Form |
|-------------|-----------|------------|-------------|
| Contract Test | **Unambiguous** | Provider must conform to consumer | `Fix:` — single directive |
| Conformance Test | **Ambiguous** | Either side could be intentionally changed | `IF/THEN` — developer chooses |
| Invariant Test | **Unambiguous** | The violating member is wrong | `Fix:` — with specific member ID |

**Unambiguous fault** (一意な障害): 修正先が一つに定まる。Contract Test では consumer が権威なので、provider を直す以外の選択肢がない。

**Ambiguous fault** (曖昧な障害): どちらの変更が意図的か、テストには判断できない。IF/THEN 形式で開発者の意図に委ね、両方の修正パスを提示する。

### Application

Contract Test のエラーメッセージを書くとき:
- 修正先は一つ → `Fix:` で始める
- 権威の出典を明記する (e.g., "required by src/types/option_type.ts")

Conformance Test のエラーメッセージを書くとき:
- 修正先が二つ → IF/THEN で分岐する
- 各分岐に「意図」を書く (e.g., "IF docs は正", "IF 実装は正")
- 意図が修正先を決定する構造にする

---

## Error Message Template

### Single-fix (Contract)

```
Fix: <action> in <file-path>.
<Values> are required by <source-module> (<source-file>).
Current <target> allows: [<current-values>].
```

### Multi-fix (Conformance)

```
Mismatch: <file-A> declares [<values>] not in <file-B> <field> [<current>].
IF <intent-A>, THEN <fix-for-B>.
IF <intent-B>, THEN <fix-for-A>.
```

### Invariant violation

```
Member "<id>" violates invariant: <property>.
Expected: <what-should-hold>.
Actual: <what-was-found>.
Fix: <specific-action> in <file-path>.
```

注: パスは常にリポジトリルート相対で書く (例: `src/types/option_rule.ts`)。絶対パスを埋め込むと portability を壊す (`absolute-path-checker` skill 参照)。

---

## Anti-Pattern: Partial Consumer Enumeration

### Problem

A contract (e.g., "全 OptionType は option-model を持つ") has multiple consumers, but the test only checks one of them. The unchecked consumers become blind spots.

### Real-world risk (breakdownparams)

```
OptionType の消費箇所:
  src/parser/params_parser.ts          → 分岐処理で全列挙
  src/option-models/base_option.ts     → サブクラスで表現
  src/validator/options/option_validator.ts
                                        → 種別ごとの検証
  src/factories/*                      → 生成ロジック
```

テストが parser だけを検査すると、validator や factory が新 OptionType を処理していなくても気付けない。

### Detection

Before writing a consistency test, enumerate ALL code paths that consume the contract:

```
grep -rn "OptionType\." src/ --include="*.ts" -l
```

Each file that reads the enum is a consumer. The test must cover all of them (または、consumer を集約する抽象を通す)。

### Fix pattern

```typescript
// Collect consumers explicitly, not just one entry point
const CONSUMERS = [
  { name: "ParamsParser",    classify: (t: OptionType) => parserSupports(t) },
  { name: "OptionValidator", classify: (t: OptionType) => validatorSupports(t) },
  { name: "OptionModel",     classify: (t: OptionType) => modelExists(t) },
];

for (const c of CONSUMERS) {
  for (const t of Object.values(OptionType)) {
    assert(
      c.classify(t),
      `${c.name} does not handle OptionType.${t}. ` +
        `Fix: extend the consumer or revise src/types/option_type.ts.`,
    );
  }
}
```

---

## Anti-Pattern: Shadow Contract

### Problem

A parameterized value is available but a code path hardcodes a specific value, creating a dependency that bypasses the parameter. No test catches this because tests only exercise the default value.

### Real-world risk (breakdownparams)

```typescript
// ParamsParser: OptionRule.flagOptions から key を読む ✓ (parameterized)
if (rule.flagOptions[normalized]) { /* ... */ }

// どこかの helper: "--help" を直書き ✗ (shadow contract)
if (arg === "--help") { /* ... */ }
```

`OptionRule.flagOptions` に `custom-help` を追加しても、直書き分岐が `"--help"` しか見ないため、カスタム flag が無視される。

### Detection

Search for literal option names that should come from `OptionRule`:

```
grep -rn '"--[a-z]' src/ --include="*.ts" | grep -v tests | grep -v _test
```

Any match outside test files is a potential shadow contract. Default DirectiveType / LayerType 値も同様:

```
grep -rn '"to"\|"summary"\|"defect"' src/ --include="*.ts" | grep -v tests
grep -rn '"project"\|"issue"\|"task"' src/ --include="*.ts" | grep -v tests
```

### Fix pattern

1. Replace the hardcoded value with the parameterized source
2. Add a regression test with a non-default value:

```typescript
Deno.test("flag matching respects OptionRule.flagOptions (non-default)", () => {
  const rule = buildOptionRule({ flagOptions: { "trace-only": true } });
  const parser = new ParamsParser({ optionRule: rule });

  const result = parser.parse(["--trace-only"]);
  assertEquals(result.options["trace-only"], true);
});
```

The non-default value is the key: if every test uses `"--help"` / `"--version"`, the shadow contract is invisible.

---

## Appendix: Test Tier Guidance

`tests/` 配下はテストの責務が階層化されている。**階層を越境する assert は責務重複**。

| Tier | 検査対象 | 典型的な assert |
|------|---------|----------------|
| `0_architecture/` | 型定義・モジュール境界・依存方向 | 型が export されている / 循環 import がない / enum 値数 |
| `1_structures/` | インターフェース形状・責務分担 | メソッドシグネチャ / 戻り型の discriminator / 必須フィールド |
| `2_impliments/0_fundations/` | 最小単位の振る舞い | 単一関数の入出力 |
| `2_impliments/1_cores/` | コアロジック | validator / parser の個別ケース |
| `2_impliments/2_units/` | ユニット結合 | parser + validator の結合 |
| `2_impliments/3_integrations/` | 統合 | ParamsParser の end-to-end 挙動 |
| `2_impliments/4_e2e/` | E2E | CLI 引数 → ParamsResult |
| `3_integrations/` | クロスモジュール統合 | factories + validators + option-models |
| `4_e2e/` | 最外殻 | mod.ts の公開 API 経由 |
| `5_combinatorial/` | 組み合わせ網羅 | option × param × config の直積 |

architecture test で実装詳細を assert しない。e2e test で型定義を直接検査しない。`src/**/tests/` の同一ディレクトリ配置は原則として unit 責務に限定する。
