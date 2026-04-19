---
name: test-design
description: This skill should be used when the user asks to "design test structure", "choose what to assert", "derive expected values", "write a contract test", "eliminate hardcoded test values", "improve test error messages", "review test quality", or discusses source of truth for tests, synchronization points, or diagnosability. Complements functional-testing (what to test) by guiding how to build structurally sound tests.
allowed-tools: [Read, Glob, Grep]
---

# Test Design

Build tests that derive expectations from authoritative sources, eliminate manual synchronization, and produce actionable diagnostics on failure.

このリポジトリ (breakdownparams) は Deno + JSR publish プロジェクト。TDD 前提で以下のテスト階層を持つ:

```
tests/0_architecture/   — 型・モジュール境界の制約
tests/1_structures/     — インターフェース構造・責務分担
tests/2_impliments/     — 実装レベル (0_fundations → 1_cores → 2_units → 3_integrations → 4_e2e)
tests/3_integrations/   — 統合シナリオ
tests/4_e2e/            — E2E
tests/5_combinatorial/  — 組み合わせ網羅
src/**/tests/           — 同一ディレクトリ配置のユニットテスト
src/**/*_test.ts        — 同一ディレクトリ配置の階層別テスト
```

## Core Principle

**Never let a test's expected value depend on human memory.**

If a test hardcodes a value that also exists in source code, configuration, or a schema, the test is a synchronization point. When either side changes independently, the test lies — it either passes when it shouldn't, or fails without revealing which side is wrong.

例: `ParamsResult.type` が `'zero' | 'one' | 'two' | 'error'` であることを `src/types/params_result.ts` で宣言している。テストで `["zero","one","two","error"]` をハードコードすれば同期点になる。`import` + `Object.values` で導出する。

## Decision Framework

Before writing an assertion, answer three questions:

### 1. Where is the source of truth?

| Source of Truth | Import It | Example (breakdownparams) |
|----------------|-----------|---------|
| Code enum/const | `import { X }` | `OptionType` (`src/types/option_type.ts`), `ParamsResult.type` discriminator |
| Type literal union | 型から派生 or 明示 const | `'zero' \| 'one' \| 'two' \| 'error'` in `params_result.ts` |
| Interface contract | `import type { X }` + 構造検査 | `OptionRule` (`src/types/option_rule.ts`), `CustomConfig` (`src/types/custom_config.ts`) |
| Default config | `DEFAULT_CUSTOM_CONFIG` など | DirectiveType `to\|summary\|defect` 、LayerType `project\|issue\|task` |
| Design doc | `@design_ref` tag | `docs/glossary.md`, `docs/options.md`, `docs/params.md` |

If the answer is "my head" or "the PR description", the test will rot.

### 2. What is the relationship being tested?

Test **relationships** (properties/invariants), not **specific values**.

```typescript
// Bad: hardcoded expectation
assertEquals(Object.keys(OptionType).length, 3);

// Good: relationship — every OptionType value is handled by option-models
import { OptionType } from "../../src/types/option_type.ts";
import { FlagOption } from "../../src/option-models/flag_option.ts";
import { ValueOption } from "../../src/option-models/value_option.ts";
import { UserVariableOption } from "../../src/option-models/user_variable_option.ts";

const handlers = new Map<OptionType, unknown>([
  [OptionType.FLAG, FlagOption],
  [OptionType.VALUE, ValueOption],
  [OptionType.USER_VARIABLE, UserVariableOption],
]);
const missing = Object.values(OptionType).filter((t) => !handlers.has(t));
assertEquals(missing.length, 0, `No handler for OptionType: ${missing.join(", ")}`);
```

### 3. When this fails, will the developer know what to fix?

Error messages must state:
- What is mismatched (with both sides named)
- Which file(s) to fix
- IF/THEN guidance when multiple fixes are valid

### 4. Does every assertion serve the stated invariant?

テスト 1 個が持つべき invariant は 1 つ (または密結合した少数)。

各 assertion を書く前に「この assert は **テスト名に書いた invariant** を担保しているか?」を問う。担保していない assert は:

- 別テストの責務 (責務重複)、または
- 証拠に見せかけた over-assertion (assertion bloat)

のどちらか。前者は消す、後者は invariant を言い換えるか消す。

```typescript
// テスト名: "ParamsParser returns ErrorResult when OptionRule violated"
// 担保すべき invariant: (a) type === "error" (b) error.code が設定済み

assertEquals(result.type, "error");           // ✓ (a)
assert(result.error?.code.length > 0);        // ✓ (b)
assertEquals(result.params.length, 0);        // ✗ params 0 件は ZeroParamsResult の責務
assertEquals(result.options, {});             // ✗ option 内容は option_validator_test の責務
```

### Derivation ladder

expected 値がどこから来るかの優先順位:

```
✓ import from source of truth      // import { OptionType }
✓ compute from named constants     // const DEFAULT_DIRECTIVES = ["to","summary","defect"] as const; (docs 起点)
△ arithmetic with comment          // assertEquals(x, 6) // = 2+2+2  ← 偽装されやすい
✗ bare literal                      // assertEquals(x, 6)
```

**`// 2+2+2=6` コメントは derivation ではない**。コメントは腐るし、定数変更時に追従しない。コード-level で導出すること。

## Test Patterns

### Contract Test (Layer 1)

Verify that a consumer's requirements are met by a provider. Import the consumer's declaration as source of truth.

```
Source of truth:  Module A (declares requirements)
Test target:      Config/Module B (must satisfy them)
Error guidance:   "Fix B to satisfy A" (one direction)
```

When to use: An implementation module **hardcodes** a dependency on a value that a configuration or another module must provide.

breakdownparams 例: `ParamsParser` が `OptionType` 全列挙を分岐処理している → `OptionRule` / option-models が全 `OptionType` をカバーする契約を Contract Test で検証する。

See `references/patterns.md` for implementation details.

### Conformance Test (Layer 2)

Verify mutual consistency between two peer configurations. Neither is the sole source of truth — both must agree.

```
Source A:  DEFAULT_CUSTOM_CONFIG の DirectiveType デフォルト (to|summary|defect)
Source B:  docs/params.md / docs/glossary.md 記載値
Error guidance:  IF/THEN for both directions
```

When to use: Two config-like sources that must stay in sync, but either could be the one that changed (例: `CustomConfig` デフォルトと `docs/` の仕様記述)。

See `references/patterns.md` for implementation details.

### Invariant Test

Verify a property that must always hold, regardless of specific values.

```typescript
// Invariant: every ParamsResult 派生型は type discriminator が一意
import type {
  ZeroParamsResult, OneParamsResult, TwoParamsResult, ErrorResult,
} from "../../src/types/params_result.ts";

const types: Array<ParamsResult["type"]> = ["zero", "one", "two", "error"];
const unique = new Set(types);
assertEquals(unique.size, types.length, "discriminator collision in ParamsResult union");
```

When to use: A structural relationship must hold across all members of a collection.

## Validator as Test Boundary

When a validator exists, the test's responsibility shifts (検証責任の転換):

```
Without validator:  Test → Config ↔ Code  (test directly checks consistency)
With validator:     Test → Validator → Config  (test verifies validator behavior)
```

breakdownparams では以下の validator が存在する:

- `src/validator/options/option_validator.ts` (オプション単体)
- `src/validator/options/option_combination_validator.ts` (オプション組み合わせ)
- `src/validator/options/user_variable_option_validator.ts` (user variable 用)
- `src/validator/params/{zero,one,two}_params_validator.ts` (positional 引数)
- `src/validator/security_validator.ts` + `security_policy_resolver.ts` (SecurityPolicy)

テストがこれらを迂回して `OptionRule` や `CustomConfig` を直接 assert すると Validator Bypass。

Four aspects to verify: **Acceptance** (valid input passes) / **Rejection** (invalid input caught) / **Diagnosis** (error message actionable) / **Completeness** (all design constraints covered).

Existing patterns apply: Contract → validator rejects what parser cannot handle. Invariant → every design constraint (`docs/options.md` / `docs/params.md` に記載) には validation rule が対応。Conformance → accepted values match runtime support.

See `references/patterns.md` for implementation examples and the Validator Bypass anti-pattern.

## Diagnosability

### Theory

Diagnosability (診断可能性): "a test failure is diagnosable if the failure message alone is sufficient to identify the fix" (Microsoft Research). Gerard Meszaros『xUnit Test Patterns』では Defect Localization として体系化。

テストの失敗メッセージだけで修正先が分かるかどうかが、テスト品質の基礎指標となる。

### Test Pattern Determines Message Structure

テストパターンの選択がエラーメッセージの構造まで決定する:

| Pattern | Fault type | Message structure |
|---------|-----------|-------------------|
| Contract Test | Unambiguous — provider must conform | `Fix:` single directive |
| Conformance Test | Ambiguous — either side could be wrong | `IF/THEN` branching |
| Invariant Test | Unambiguous — the violating member is wrong | `Fix:` with specific member ID |

Contract Test では修正先が一意（provider が consumer に合わせる）なので `Fix:` 形式。Conformance Test では一意に決まらない（どちらの変更が意図的か不明）なので IF/THEN で開発者の意図に委ねる。

### Message Requirements

Every assertion message must contain:

1. **What** — the mismatch, with concrete values from both sides
2. **Where** — file paths of both sides (例: `src/types/option_type.ts` と `src/option-models/`)
3. **How to fix** — `Fix:` (single direction) or `IF/THEN` (ambiguous fault)

For full message templates and examples, see `references/patterns.md`.

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Hardcoded expected list | Manual sync required when source changes | Import from source of truth (`Object.values(OptionType)` etc.) |
| Magic number assertion | `assertEquals(x, 3)` — why 3? | Derive from authoritative definition |
| Manual subset selection | `["FLAG", "VALUE"]` cherry-picked from enum | `Object.values(OptionType)` for full coverage |
| Silent pass on empty | Loop over empty `options` passes vacuously | Assert collection is non-empty first |
| Opaque failure | `assert(false)` with no context | Include file paths and IF/THEN guidance |
| Partial consumer enumeration | Contract の消費者が複数 (parser / validator / option-model) あるのにテストが一部しか検査しない | 全ての消費箇所を列挙してからテストを書く |
| Shadow contract | パラメータ化された経路をバイパスするハードコード値 (例: `OptionRule` を参照せず `"--help"` を直書き) | ハードコード値をパラメータに置換し、非デフォルト値で回帰テスト |
| Validator bypass | `option_combination_validator` が存在するのにテストが設定を直接検証する | validator の動作をテストする; 検証責任は validator にある |
| Prose derivation alibi | `// to+summary+defect=3` コメントで magic number を "derived" に偽装 | named constant で **コード-level に** 導出 (Derivation ladder 参照) |
| Assertion bloat | 1 テストが stated invariant 外の assert を抱える (他テストの責務と重複) | invariant 外の assert は削除し、既存の責務テストに委ねる |
| Delegation trust | sub-agent の skill 適用 summary を検証せず通す | 親が同 skill の lens で re-audit (既存 assert も全スキャン) |
| Test-only production logic | テストが production と異なるロジックを実装する (CLAUDE.md 禁止事項) | production logic を直接呼び、テスト専用分岐は作らない |

See `references/patterns.md` for detailed explanations of these anti-patterns.

## Workflow

0. **Check for existing validator** — if a validator (`src/validator/**`) covers this constraint, test the validator's behavior, not the constraint directly
1. **Identify the invariant** — what relationship must always hold? (e.g., 「全 `OptionType` は option-model class を持つ」)
2. **Locate the source of truth** — which module/file authoritatively defines the expectation? (`src/types/` 配下が第一候補)
3. **Enumerate all consumers** — the invariant を消費する全てのコードパスを洗い出す (parser, option_validator, option_combination_validator, params validators, factories, etc.)
4. **Import, don't copy** — derive expected values from the source (`import { ... } from "../../src/..."`)
5. **Choose the pattern** — Contract (one-way) or Conformance (two-way)?
6. **Write the assertion** — test the relationship, not a specific value
7. **Craft the error message** — include What/Where/How-to-fix (絶対パスは埋め込まない; リポジトリ相対パスで書く — `absolute-path-checker` skill 参照)
8. **Verify non-vacuity** — ensure the test exercises real data (`length > 0` guard)
9. **Hunt shadow contracts** — grep for hardcoded values that bypass the parameterized path (`grep -rn '"--help"' src/`, `grep -rn '"to"\|"summary"\|"defect"' src/` 等)
10. **Scope expansion on review** — 指定された箇所で Anti-Pattern を発見したら、**同ファイル内で grep して同種違反を全スキャン**。レビュー対象行だけ直すのは現状維持バイアス
11. **Re-audit on delegation** — sub-agent にテスト作成を委譲したら、返ってきた diff に対して親が本 skill の lens で再監査 (特に Derivation ladder, Assertion bloat)
12. **Respect test tier** — テスト階層 (`0_architecture` → `1_structures` → `2_impliments`) の責務を尊重。architecture test に implementation assert を入れない

## Relation to Other Skills

| Skill | Focus | Complements test-design by |
|-------|-------|---------------------------|
| `run-tests` | Debug logging + execution | テスト実行と BreakdownLogger 出力確認 |
| `fix-checklist` | Root cause before fix | Ensuring the right invariant is identified |
| `refactoring` | Safe structural changes | Defining before/after contracts |
| `docs-consistency` | docs ↔ implementation 一致 | Conformance Test 側の authoritative source 特定 |
| `absolute-path-checker` | 絶対パス排除 | エラーメッセージのパス表記を相対化 |
| `breakdownlogger-debug-with-logger` | Test execution tracing | Visualizing runtime behavior when failure messages alone are insufficient to diagnose |
| `breakdownlogger-implement-logger` | Logger placement in production | テスト経由で KEY 名を確認する invariant test の設計 |

## Reference

For detailed pattern implementations with full code examples, read `references/patterns.md`.
