# Testing Specification

## Test Design Principles

Tests are designed according to the following principles:

1. **Progressive Complexity**
   - Start with basic functionality and gradually progress to complex use cases
   - Verify that necessary prerequisites are met at each stage
   - Assume that previous stage tests have passed

2. **Hierarchical Structure**
   - Basic Tests (verification of basic functionality)
   - Core Function Tests (verification of core features)
   - Unit Function Tests (verification of individual features)
   - Integration Function Tests (verification of feature interactions)
   - End-to-End Tests (verification of overall operation)

3. **Numbered Ordering**
   - Test files are numbered (e.g., `01_basic_test.ts`)
   - Numbers indicate execution order
   - Clearly shows dependencies

4. **Execution Order Guarantee**
   - Tests are executed in numerical order
   - Verify that previous stage tests have passed
   - Control execution order based on dependencies

## Test Directory Structure

```
tests/
├── 01_basic/                    # Basic Tests
│   ├── 01_no_params_test.ts     # No parameters test
│   └── 02_single_param_test.ts  # Single parameter test
│
├── 02_core/                     # Core Function Tests
│   └── 01_double_params_test.ts # Two parameters test
│
├── 03_unit/                     # Unit Function Tests
│   ├── 01_options_test.ts       # Options processing test
│   └── 02_extended_params_test.ts # Extended parameters test
│
├── 04_integration/              # Integration Function Tests
│   └── 01_error_test.ts         # Error handling test
│
└── 05_e2e/                      # End-to-End Tests
    └── 01_params_parser_test.ts # Parameter parser integration test
```

## Test Hierarchy Structure

Tests are implemented according to the following hierarchical structure:

1. **Basic Tests** (`01_basic/`)
   - `01_no_params_test.ts`: No parameters case
   - `02_single_param_test.ts`: Single parameter case

2. **Core Function Tests** (`02_core/`)
   - `01_double_params_test.ts`: Two parameters case

3. **Unit Function Tests** (`03_unit/`)
   - `01_options_test.ts`: Basic options processing functionality
   - `02_extended_params_test.ts`: Extended parameters functionality
     - Extended mode enable/disable
     - DemonstrativeType extension settings
     - LayerType extension settings
     - Custom validation rules
     - Error message customization

4. **Integration Function Tests** (`04_integration/`)
   - `01_error_test.ts`: Verification of various error cases

5. **End-to-End Tests** (`05_e2e/`)
   - `01_params_parser_test.ts`: Comprehensive parser operation verification

### Test Dependencies

Tests are executed in the following order:

1. Basic Tests (`01_basic/`)
   - 01: No parameters
   - 02: Single parameter

2. Core Function Tests (`02_core/`)
   - 01: Two parameters

3. Unit Function Tests (`03_unit/`)
   - 01: Options processing
   - 02: Extended parameters processing

4. Integration Function Tests (`04_integration/`)
   - 01: Error handling

5. End-to-End Tests (`05_e2e/`)
   - 01: Parser integration

## Test Execution Procedure

### Recommended: Local Execution of Batch Tests and CI Flow

To execute all project tests, formatting, and lint checks in batch, use the following script:

```bash
deno task ci
```

- Reproduces the CI flow locally
- Executes all *_test.ts files in sequence, performs formatting and lint checks after tests pass
- For detailed debug output on error, use `LOG_LEVEL=debug deno task ci`
- Tests are executed in dependency order (numerical order)
- Always ensure all checks pass with this script before commit, push, or merge

### Running Specific Test Files

```bash
deno test <test_file.ts> --allow-env --allow-write --allow-read --allow-run
```

## Debug Output

Use BreakdownLogger in test code "only".
When adding debug output to main code, do not use BreakdownLogger, but explicitly write console.debug("[DEBUG]") so it can be removed later.

### Usage in Test Code

```typescript
import { BreakdownLogger } from '@tettuan/breakdownlogger';

const logger = new BreakdownLogger();
logger.debug('Test execution started', { testName: 'example' });
```

### Log Levels

- `debug`: Detailed debug information
- `info`: Important process start/end
- `warn`: Warning (recoverable error)
- `error`: Error (process interruption)

## Error Handling and Debugging

### Investigation Procedure for Errors

1. Check debug logs
2. Verify test environment state
3. Execute related test cases
4. Document error reproduction steps

### Response to Test Failures

1. Check error message
2. Re-run in debug mode
3. Verify related implementation
4. Determine pre-test failure
5. Fix and re-test

### Pre-test Failure Determination

- If failure occurs in pre-processing not intended for testing, a separate pre-processing test is needed
- Pre-processing tests should be placed in earlier stages to be executed first by local_ci.sh
- Examples of pre-processing:
  - Test for setting validation fails due to setting file read failure
    - Create a test for setting file reading
- Examples of non-pre-processing:
  - Test for setting validation fails due to setting value mismatch
- Test pre-processing should utilize confirmed processes executed before the relevant test. It's important that later stage tests don't implement their own pre-processing.

# Skeleton Code Construction Order (Test-Driven)

- Create test files according to the "Test Directory Structure"
- Create skeleton: Write test items as test targets first (don't write test content yet)
- Include failing test statements in the skeleton
- Add comments
  - Write what you would want to know when reading someone else's code
  - Document test intentions, purposes, and reasons for testing
  - Clearly state what the test handles 

---

[日本語版](testing.ja.md) | [English Version](testing.md) 