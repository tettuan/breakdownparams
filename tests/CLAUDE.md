# Tests:

- Place e2e and integrated tests, including fixtures, in the `tests/` directory.
- architecture, structre, unit tests are placed at `<source_codes>/*_test.ts` or `<source_codes>/tests/*_test.ts`.
  - same dir of source code.

[CAUTION]
Stick to testing production logic so that tests do not add implementations that only tests use or pass “different logic than production”.
