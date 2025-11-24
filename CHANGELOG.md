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
