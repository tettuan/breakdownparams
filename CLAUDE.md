- Project: Deno, JSR publish
- run `deno task ci`https://jsr.io/@tettuan/breakdownprompt/publish`
- when commit, need to pass the test
  - run `deno test <something_test.ts> --allow-env --allow-write --allow-read --allow-run` before git commit <something.ts> and <something_test.ts>.
- run `deno task ci` before merge or push.
- tests and fixtures must be in `tests/`.
- Make full use of OOP, design patterns, TDD, and use cases.

# Language
- Chat in Japanese
- Write Code in English

# Type safety:
- Enable strict: true
- Use explicit type definitions

# Readable:
- don't use magic numbers, use ENUM
- use JSDoc

# Lint and Format
- if test passes, then fix linter, fmt. not fix linter and fmt prior to fix errors.
- use `deno fmt` and `deno lint` to check
- Adopt the format used by `deno fmt` when writing code
- read `deno.json` for settings

# Git push
- DO NOT push untile `deno task ci` pass all.
- run  `LOG_LEVEL=debug deno task ci` (DEBUG=true deno task ci) if error.

# Run Tests
- run `deno task ci` first. catch outlines of errors.
- if errors, run `LOG_LEVEL=debug deno task ci` for details.

## Order to fix errors
- Fixing in a step by step manner
  - Choose one error to fix.
  - First, fix one test and the corresponding application code.
  - If that test passes, fix one of the following errors.
  - test only the specific test file that is fixed.
    `LOG_LEVEL=debug deno test <something_test.ts> --allow-env --allow-write --allow-read`
- Fix them in order (in the following order), starting from the root of the application
  - Initial loading
  - Use case entry
  - Conversion
  - Output
  - Integration
  - Edge case

## Debug output to standard output
- use `BreakdownLogger`, import from `https://jsr.io/@tettuan/breakdownlogger`
- Prohibit the use of `BreakdownLogger` for anything other than test files.

# specifications
- read start from `docs/index.md` and `docs/glosarry.md`.

# Comments
- Write Comments when only test passes.
- Use JDocs. write purpose, expects, intent, reason.

# release new version
- run `scripts/bump_version.sh` when ordered.
  - do not speculate if it will release.
