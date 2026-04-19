# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- **BREAKING**: Renamed `--input/-i` option to `--edition/-e`
  - The internal result key is now `edition` instead of `input`
  - `result.options['input']` is now `result.options['edition']`

### Deprecated

- `--input/-i` is deprecated but kept for backward compatibility
  - Will continue to work as an alias for `--edition/-e`
  - Both `--input=task` and `--edition=task` will produce `{ edition: 'task' }`
  - Users should migrate to `--edition/-e` for new code

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
