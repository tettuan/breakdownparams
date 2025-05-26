# File Structure Description

## Directory Structure

```
src/
├── core/                    # Core features
│   ├── params/             # Parameter processing
│   │   ├── definitions/    # Parameter definitions
│   │   └── processors/     # Parameter processors
│   ├── options/            # Option processing
│   │   ├── definitions/    # Option definitions
│   │   └── processors/     # Option processors
│   └── errors/             # Error definitions and handling
├── types/                  # Type definitions
├── validators/             # Validation logic
└── utils/                  # Utilities
```

## Directory Roles

### core/
Modules providing core features

#### params/
Modules related to parameter processing
- `definitions/`: Parameter definitions (types, constants, etc.)
- `processors/`: Parameter processing logic

#### options/
Modules related to option processing
- `definitions/`: Option definitions (types, constants, etc.)
- `processors/`: Option processing logic

#### errors/
Modules related to error handling
- Error definitions
- Error factory
- Error handling utilities

### types/
Type definitions used throughout the application
- Common type definitions
- Interface definitions

### validators/
Validation logic
- Parameter validation
- Option validation
- Custom validation

### utils/
Common utilities
- String processing
- File operations
- Other helper functions

## File Migration Plan

### Current File → New Location

1. Parameter-related
   - `src/params_parser.ts` → `src/core/params/processors/params_parser.ts`
   - `src/parsers/*` → `src/core/params/processors/`
   - `src/types.ts` (parameter-related) → `src/core/params/definitions/types.ts`

2. Option-related
   - `src/utils/option_parser.ts` → `src/core/options/processors/option_parser.ts`
   - `src/utils/option_processor.ts` → `src/core/options/processors/option_processor.ts`
   - `src/types/option_config.ts` → `src/core/options/definitions/option_config.ts`

3. Error-related
   - `src/error_factory.ts` → `src/core/errors/error_factory.ts`
   - `src/types.ts` (error-related) → `src/core/errors/definitions/types.ts`

4. Validation-related
   - `src/validators/*` → `src/validators/`

5. Common type definitions
   - `src/types.ts` (common) → `src/types/common.ts`

6. Utilities
   - `src/utils/*` (others) → `src/utils/`

## Migration Steps

1. Create the new directory structure
2. Move files
3. Update import paths
4. Update tests
5. Update documentation 