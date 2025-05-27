# Directory Structure

The `src` directory contains the following files and directories:

- `params_parser.ts`: Main parameter parser implementation
- `types.ts`: Type definitions for the parameter parser
- `mod.ts`: Module entry point and exports
- `constants/`: Directory containing constant definitions
- `core/`: Core functionality and base implementations
- `utils/`: Utility functions and helper classes
- `validators/`: Validation logic for different parameter types

## Directory Details

### Constants

Contains error messages, configuration values, and other constant definitions. Files should be organized by domain (e.g., `error_messages.ts`, `config_values.ts`). Constants should be exported as named exports for better tree-shaking.

### Core

Houses the fundamental building blocks of the application. Includes base classes, interfaces, and abstract implementations. Files should follow a clear inheritance hierarchy and maintain loose coupling.

### Utils

Contains reusable utility functions and helper classes. Each file should focus on a specific domain (e.g., `string_utils.ts`, `validation_utils.ts`). Functions should be pure and well-documented.

### Validators

Implements validation logic for different parameter types. Each validator should extend a base validator class and implement specific validation rules. Files should be named according to the parameter type they validate (e.g., `single_param_validator.ts`, `double_params_validator.ts`).
