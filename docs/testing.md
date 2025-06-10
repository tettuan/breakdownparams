# Testing Specification

## Test Design Principles

Tests are designed according to the following principles:

1. **Progressive Complexity**
   - Start with basic functionality and gradually progress to complex use cases
   - Verify that necessary prerequisites are met at each stage
   - Assume that previous stage tests have passed

2. **Hierarchical Structure**
   - Unit tests (placed in the same hierarchy as implementation files)
   - Architecture tests (placed in the same hierarchy as implementation files)
   - Structure tests (placed in the same hierarchy as implementation files)
   - Integration tests (placed under tests/)
   - E2E tests (placed under tests/)

3. **Test File Placement**
   - Unit/Architecture/Structure tests: Same hierarchy as implementation files
   - Integration/E2E tests: Under tests/ directory

4. **Execution Order Guarantee**
   - Control execution order based on dependencies
   - Verify that previous stage tests have passed

## Test Directory Structure

```
src/
├── models/
│   ├── model.ts
│   ├── 0_architecture_model.ts # Architecture test
│   ├── 1_structure_model.ts   # Structure test
│   └── 2_unit_model.ts        # Unit test
│
├── types/
│   ├── type.ts
│   ├── 0_architecture_type.ts
│   ├── 1_structure_type.ts
│   └── 2_unit_type.ts
│
└── parser/
    ├── params_parser.ts
    ├── 0_architecture_params_parser.ts
    ├── 1_structure_params_parser.ts
    └── 2_unit_params_parser.ts

tests/
├── integration/             # Integration tests
│   └── 3_integration_params_parser.ts
│
└── e2e/                    # E2E tests
    └── 4_e2e_params_parser.ts
```

## Test File Naming Convention

Test files follow the naming convention based on their purpose:

1. **Architecture Tests**
   - Naming convention: `0_architecture_<implementation_file_name>.ts`
   - Example: `0_architecture_model.ts`
   - Purpose: Verification of architectural constraints and dependencies
   - Placement: Same hierarchy as implementation file
   - Verification items:
     - Direction of dependencies
     - Presence of circular references
     - Boundaries between layers
     - Interface consistency

2. **Structure Tests**
   - Naming convention: `1_structure_<implementation_file_name>.ts`
   - Example: `1_structure_model.ts`
   - Purpose: Verification of class structure and separation of concerns
   - Placement: Same hierarchy as implementation file
   - Verification items:
     - Adherence to single responsibility principle
     - Absence of responsibility duplication
     - Appropriate abstraction level
     - Relationships between classes

3. **Unit Tests**
   - Naming convention: `2_unit_<implementation_file_name>.ts`
   - Example: `2_unit_model.ts`
   - Purpose: Functional behavior verification
   - Placement: Same hierarchy as implementation file

4. **Integration Tests**
   - Naming convention: `3_integration_<feature_name>.ts`
   - Example: `3_integration_params_parser.ts`
   - Purpose: Verification of cooperation between multiple components
   - Placement: tests/integration/

5. **E2E Tests**
   - Naming convention: `4_e2e_<feature_name>.ts`
   - Example: `4_e2e_params_parser.ts`
   - Purpose: End-to-end behavior verification
   - Placement: tests/e2e/

## Test Dependencies

Tests are executed in the following order:

1. Model and Type Tests
   - Verification of basic data structures and types
   - Validation rule verification

2. Derived Component Tests
   - Verification of functionality using models and types
   - Factory and utility verification

3. ParamsParser Tests
   - Individual function verification
   - Overall integration verification

### Example of Dependencies

```
models/
  └── model.ts
      ├── 0_architecture_model.ts
      ├── 1_structure_model.ts
      └── 2_unit_model.ts

types/
  └── type.ts
      ├── 0_architecture_type.ts
      ├── 1_structure_type.ts
      └── 2_unit_type.ts

parser/
  └── params_parser.ts
      ├── 0_architecture_params_parser.ts
      ├── 1_structure_params_parser.ts
      └── 2_unit_params_parser.ts

tests/
  ├── integration/
  │   └── 3_integration_params_parser.ts
  └── e2e/
      └── 4_e2e_params_parser.ts
```

## Test Execution Procedure

### Recommended: Batch Test and Local CI Flow Execution

To execute tests, formatting, and lint checks for the entire project at once, use the following script:

```bash
deno task ci
```

- Reproduces the CI flow locally
- Executes all tests in dependency order, then performs format and lint checks after tests pass
- For detailed debug output on errors, use `LOG_LEVEL=debug deno task ci`
- Always ensure all checks pass with this script before committing, pushing, or merging

### Executing Specific Test Files

```bash
deno test <test_file.ts> --allow-env --allow-write --allow-read --allow-run
```

## Debug Output

Use BreakdownLogger in test code ONLY.
When adding debug output to main code, do not use BreakdownLogger; explicitly write console.debug("[DEBUG]") so it can be removed later.

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
3. Execute related test cases
4. Document error reproduction steps

### Response to Test Failures

1. Check error messages
2. Re-execute in debug mode
3. Verify related implementation
4. Determine if test failure is preprocessing
5. Fix and retest

### Test Failure Preprocessing Determination

- If failure occurs in preprocessing not intended for testing, a separate preprocessing test is needed
- Preprocessing tests should be placed in earlier stages to be executed first in local_ci.sh
- Preprocessing examples:
  - Configuration determination test fails due to configuration file read failure
    - Create a configuration file read test
- Non-preprocessing examples:
  - Configuration determination test fails because configuration values don't match
- Test preprocessing should use verified processes executed before the relevant test. It's important that downstream tests don't implement their own.

# Skeleton Code Construction Order (Test-Driven)

- Create test files in the same hierarchy as implementation files
- Create skeleton: Write test items as test targets first (don't write test content yet)
- Include failing assertions in the skeleton
- Write comments
  - Write what you would want to know when reading someone else's code
  - Describe the intent and purpose of the test, and the reason why you thought it should be tested
  - Clearly state what the test handles

---

[日本語版](testing.ja.md) | [English Version](testing.md)