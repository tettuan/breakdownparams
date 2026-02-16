---
name: local-ci
description: Run local CI checks before merge or push. Use when user says 'CI', 'ローカルCI', or before creating PRs.
allowed-tools: [Bash, Read]
---

Run the local CI script to validate the project.

## Steps

1. Run `deno task ci`
2. If errors occur, re-run with debug logging: `LOG_LEVEL=debug deno task ci`
3. Report results

## CI pipeline stages (@aidevtool/ci)

1. **check** - Type checking (`deno check`)
2. **test** - Run all tests in `tests/`
3. **fmt** - Format check (`deno fmt --check`)
4. **lint** - Lint check (`deno lint`)

DO NOT push until all checks pass.
