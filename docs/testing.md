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
│   └── 02_one_param_test.ts     # One parameter test
│
├── 02_core/                     # Core Function Tests
│   └── 01_two_params_test.ts # Two parameters test
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
   - `02_one_param_test.ts`: One parameter case

2. **Core Function Tests** (`02_core/`)
   - `01_two_params_test.ts`: Two parameters case

3. **Unit Function Tests** (`03_unit/`)
   - `