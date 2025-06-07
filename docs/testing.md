# Testing Specifications

## Test Design Principles

Tests are designed following these principles:

1. **Progressive Complexity**
   - Start with basic functionality and gradually move to complex use cases
   - Verify that necessary prerequisites are met at each stage
   - Assume previous stage tests have passed

2. **Hierarchical Structure**
   - Basic tests (verification of basic functionality)
   - Core functionality tests (verification of core features)
   - Unit functionality tests (verification of individual features)
   - Integration functionality tests (verification of feature interactions)
   - End-to-end tests (verification of overall operation)

3. **Numbered Ordering**
   - Assign numbers to test files (e.g., `01_basic_test.ts`)
   - Numbers indicate execution order
   - Clearly show dependencies

4. **Execution Order Guarantee**
   - Tests are executed in numerical order
   - Verify that previous stage tests have passed
   - Control execution order based on dependencies

## Test Directory Structure

```
tests/
├── 01_basic/                    # Basic tests
│   ├── 01_zero_params_test.ts     # No parameters test
│   └── 02_one_param_test.ts     # Single parameter test
│
├── 02_core/                     # Core functionality tests
│   └── 01_two_params_test.ts # Two parameters test
│
├── 03_unit/                     # Unit functionality tests
│   ├── 01_options_test.ts       # Option processing test
│   └── 02_extended_params_test.ts # Extended parameters test
│
├── 04_integration/              # Integration functionality tests
│   └── 01_error_test.ts         # Error handling test
│
└── 05_e2e/                      # End-to-end tests
    └── 01_params_parser_test.ts # Parameter parser integration test
```

## Test File Naming Conventions

Test files follow these naming conventions based on their purpose:

1. **Regular Tests**
   - Naming convention: `*_test.ts`
   - Example: `01_zero_params_test.ts`
   - Purpose: Functionality verification

2. **Architecture Tests**
   - Naming convention: `*.architecture_test.ts`
   - Example: `params_parser.architecture_test.ts`
   - Purpose: Verification of architectural constraints and dependencies
   - Verification items:
     - Dependency direction
     - Presence of circular references
     - Layer boundaries
     - Interface consistency
   - Constraints:
     - Avoid excessive use of stubs and mocks
     - Verify actual dependencies
     - Minimize test complexity

3. **Structure Tests**
   - Naming convention: `*.structure_test.ts`
   - Example: `validator.structure_test.ts`
   - Purpose: Verification of class structure and responsibility separation
   - Verification items:
     - Single responsibility principle compliance
     - Presence of responsibility duplication
     - Appropriate abstraction level
     - Class relationships
   - Constraints:
     - Avoid excessive use of stubs and mocks
     - Verify actual class structure
     - Minimize test complexity

### Naming Convention Examples

```
tests/
├── 01_basic/
│   ├── 01_zero_params_test.ts
│   ├── 01_zero_params.architecture_test.ts
│   └── 01_zero_params.structure_test.ts
│
└── 02_core/
    ├── 01_two_params_test.ts
    ├── 01_two_params.architecture_test.ts
    └── 01_two_params.structure_test.ts
```

### Test Execution Order

1. Architecture Tests
   - First verify design constraints are met
   - Verify dependency direction

2. Structure Tests
   - Verify class structure integrity
   - Verify responsibility separation

3. Regular Tests
   - Verify functionality
   - Verify use cases

## Test Hierarchy Structure

Tests are implemented following this hierarchical structure:

1. **Basic Tests** (`01_basic/`)
   - `01_zero_params_test.ts`: No parameters case
   - `02_one_param_test.ts`: Single parameter case

2. **Core Functionality Tests** (`02_core/`)
   - `01_two_params_test.ts`: Two parameters case

3. **Unit Functionality Tests** (`03_unit/`)
   - `01_options_test.ts`: Basic option processing
   - `02_extended_params_test.ts`: Extended parameters functionality
     - Extended mode enable/disable
     - DemonstrativeType extension settings
     - LayerType extension settings
     - Custom validation rules
     - Error message customization

4. **Integration Functionality Tests** (`04_integration/`)
   - `01_error_test.ts`: Various error case verification

5. **End-to-end Tests** (`05_e2e/`)
   - `01_params_parser_test.ts`: Parser integration verification

### Test Dependencies

Tests are executed in the following order:

1. Basic Tests (`01_basic/`)
   - 01: No parameters
   - 02: Single parameter

2. Core Functionality Tests (`02_core/`)
   - 01: Two parameters

3. Unit Functionality Tests (`03_unit/`)
   - 01: Option processing
   - 02: Extended parameter processing

4. Integration Functionality Tests (`04_integration/`)
   - 01: Error handling

5. End-to-end Tests (`05_e2e/`)
   - 01: Parser integration

## Test Execution Procedure

### Recommended: Batch Testing and Local CI Flow Execution

To run all project tests, formatting, and lint checks in batch, use the following script:

```bash
deno task ci
```

- Reproduces the CI flow locally
- Executes all *_test.ts files in sequence, followed by formatting and lint checks
- Use `LOG_LEVEL=debug deno task ci` for detailed debug output on error
- Tests are executed in dependency order (numerical order)
- Always run this script to pass all checks before commit, push, or merge

### Running Specific Test Files

```bash
deno test <test_file.ts> --allow-env --allow-write --allow-read --allow-run
```

## Debug Output

Use BreakdownLogger only in test code.
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
- `warn`: Warnings (recoverable errors)
- `error`: Errors (process interruption)

## Error Handling and Debugging

### Investigation Procedure for Errors

1. Check debug logs
2. Verify test environment state
3. Run related test cases
4. Document error reproduction steps

### Response to Test Failures

1. Check error message
2. Re-run in debug mode
3. Check related implementation
4. Determine if failure is in pre-processing
5. Fix and re-test

### Pre-processing Failure Determination

- If failure occurs in pre-processing not related to test purpose, a separate pre-processing test is needed
- Pre-processing tests should be placed in earlier stages to be executed by local_ci.sh
- Pre-processing examples:
  - Test fails in configuration file reading during configuration validation
    - Create configuration file reading test
- Non-pre-processing examples:
  - Test fails due to configuration value mismatch during configuration validation
- Test pre-processing should use verified processes executed before the test. It's important that later stage tests don't implement their own.

# Skeleton Code Construction Order (Test-Driven)

- Create test files according to "Test Directory Structure"
- Create skeleton: Write test items as test targets first (don't write test content yet)
- Include failing test statements in skeleton
- Add comments
  - Include what you would want to know when reading someone else's code
  - Describe test intentions, purposes, and reasons for testing
  - Clearly state what the test handles

---

[日本語版](testing.ja.md) | [English Version](testing.md) 