# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.3.0] - 2026-04-19

### Added

- Configurable `SecurityPolicy` with 5 categories (`shellInjection`, `absolutePath`, `homeExpansion`, `parentTraversal`, `specialChars`) × 3 levels (`off`, `safe`, `strict`)
- `ValueKind` (`'path' | 'text'`) on value-option definitions to scope path-oriented checks
- Per-option `securityPolicy` override (relaxes path categories only; `shellInjection` remains global)
- Two-phase validation: `shellInjection` on raw args before option resolution, path categories after
- New types exported from `mod.ts`: `Level`, `SecurityPolicy`, `ValueKind`, `SecurityCategory`, `SecurityCategoryLevels`

### Changed

- **BREAKING**: Renamed `--input/-i` option to `--edition/-e`
  - The internal result key is now `edition` instead of `input`
  - `result.options['input']` is now `result.options['edition']`
- Default security policy is `'safe'` for every category (was: only `shellInjection` `;|&<>` and `parentTraversal` `../` were enforced)
- `SecurityValidator` constructor now accepts an optional `CustomConfig`
- Security error message format unified to `Security error: <category> violation in <context>` (was: distinct strings per category)
- Built-in value options classified by kind: `from`, `destination` are `kind: 'path'`; `config`, `input`, `edition`, `adaptation` are `kind: 'text'`

### Deprecated

- `--input/-i` is deprecated but kept for backward compatibility
  - Will continue to work as an alias for `--edition/-e`
  - Both `--input=task` and `--edition=task` will produce `{ edition: 'task' }`
  - Users should migrate to `--edition/-e` for new code

### BREAKING CHANGES

- **Path-kind options reject more inputs by default**: `--from=/abs/path`, `--from=~/foo`, and values containing NUL/control chars are now rejected. To restore v1.2.x permissiveness, set `securityPolicy: { absolutePath: 'off', homeExpansion: 'off', specialChars: 'off' }` per-option or globally.
- **Text-kind options no longer receive path-traversal checks**: `--config=../sibling`, `--edition=../foo`, `--input=../bar`, `--adaptation=../baz` now pass. Callers needing path-traversal protection on these must change `kind` to `'path'`.
- **Positional parameters no longer receive path-traversal checks**: previously `breakdown ../layer detail` was rejected; now it passes. Shell-injection scanning still applies. Callers needing path-traversal on positional params need to validate them upstream.
- **Security error messages changed format**. Code that pattern-matches on the previous strings (e.g., `'Path traversal attempt detected'`) must update to the new format.

### Migration

Reference `docs/custom_params.md` (Security Policy section) for migration recipes.

### Resolves

- Closes #3 (Path Injection Countermeasures)

## [1.2.3] - 2026-04-19

### Fixed

- `SecurityValidator` no longer rejects `--uv-*` values containing ellipsis (`...`), `..text`, or narrative `..` sequences (#42)
- `SecurityValidator` no longer over-matches non-traversal patterns like `..README` or `..foo` as path traversal attempts (#42)
- `OneOptionValidator` now honors `CustomConfig.validation.one.allowedOptions`; `init --config=test` and other one-parameter option combinations declared in CustomConfig are accepted (#23)
- `TwoOptionValidator` now honors `CustomConfig.validation.two.allowedOptions` and `allowedValueOptions`; user overrides take effect instead of being silently ignored
- `ZeroOptionValidator` now honors `CustomConfig.validation.zero.allowedOptions`; defaults like `--help` and `--version` come from CustomConfig instead of an empty hard-coded list

### Changed

- `SecurityValidator` path traversal check now applies only to non-`--uv-*` arguments; shell injection check still applies to all arguments
- Path traversal regex tightened to match only genuine traversal tokens: `../`, `..\`, or trailing `..`
- `ParamsParser` now injects `CustomConfig` into `ZeroOptionValidator`, `OneOptionValidator`, and `TwoOptionValidator` at construction time
- `BaseOptionValidator` constructor signature changed to `protected constructor(paramType, customConfig?)`; subclasses accept an optional `CustomConfig` and fall back to `DEFAULT_CUSTOM_CONFIG`

### Security

- Path traversal detection is now scoped to path-bearing arguments, eliminating false positives that previously blocked legitimate user-variable content (#42)
