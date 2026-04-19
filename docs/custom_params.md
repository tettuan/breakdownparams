# Custom Configuration Specification

This document defines the specification for custom configuration functionality in the breakdownparams library.

## 1. Overview

The custom configuration functionality enables configurable validation rules for parameters, option definitions, and their combination rules.
By using default configuration values, it supports standard usage patterns while allowing custom configuration to be applied as needed.

## 2. Configurable Items

### 2.1 Parameter Configuration

1. **DirectiveType**
   - Default pattern: `^(to|summary|defect)$`
   - Custom pattern: Specified in configuration values
   - List of allowed values

2. **LayerType**
   - Default pattern: `^(project|issue|task)$`
   - Custom pattern: Specified in configuration values
   - List of allowed values

### 2.2 Option Configuration

1. **Flag Options**
   - Boolean type options like help, version
   - Short form definitions

2. **Value Options**
   - Options with values like from, destination, input, adaptation, config
   - Short form definitions

3. **User Variables**
   - User-defined variables in `--uv-*` format
   - Pattern and allowed mode definitions

### 2.3 Validation Rules

For each parameter mode (zero/one/two):
- List of allowed options (`validation.{zero,one,two}.allowedOptions`)
- Allow/disallow user variables

#### Semantics of `validation.{zero,one,two}.allowedOptions`

- This list defines the canonical option names that the corresponding `OptionValidator`
  (`ZeroOptionValidator` / `OneOptionValidator` / `TwoOptionValidator`) treats as allowed for that parameter mode.
- It **replaces** the default list — it is not additive. Whatever the caller writes here becomes the allow-list used by the OptionValidator. To extend the defaults, spread `DEFAULT_CUSTOM_CONFIG.validation.{mode}.allowedOptions` and append.
- `ParamsParser` injects the `CustomConfig` into each `OptionValidator` at construction time, so the values configured here directly determine which options are accepted in each mode.

## 3. Configuration Values

### 3.1 Configuration Structure

```typescript
interface CustomConfig {
  // Parameter configuration
  params: {
    two: {
      directiveType: {
        pattern: string;
        errorMessage: string;
      };
      layerType: {
        pattern: string;
        errorMessage: string;
      };
    };
  };
  
  // Option definitions
  options: {
    flags: Record<string, {
      shortForm?: string;
      description: string;
    }>;
    values: Record<string, {
      shortForm?: string;
      description: string;
      valueRequired?: boolean;
      kind?: ValueKind;              // 'path' | 'text'; defaults to 'text'
      securityPolicy?: SecurityPolicy; // per-option override
    }>;
    userVariables: {
      pattern: string;
      description: string;
    };
  };
  
  // Validation rules
  validation: {
    zero: ValidationRules;
    one: ValidationRules;
    two: ValidationRules;
  };
  
  // Error handling configuration
  errorHandling: {
    unknownOption: 'error' | 'ignore' | 'warn';
    duplicateOption: 'error' | 'ignore' | 'warn';
    emptyValue: 'error' | 'ignore' | 'warn';
  };

  // Security policy (optional; runtime defaults to { policy: 'safe' })
  security?: {
    policy: SecurityPolicy;
  };
}
```

### 3.2 Default Configuration Values

```typescript
const DEFAULT_CUSTOM_CONFIG: CustomConfig = {
  params: {
    two: {
      directiveType: {
        pattern: '^(to|summary|defect)$',
        errorMessage: 'Invalid directive type. Must be one of: to, summary, defect',
      },
      layerType: {
        pattern: '^(project|issue|task)$',
        errorMessage: 'Invalid layer type. Must be one of: project, issue, task',
      },
    },
  },
  options: {
    flags: {
      help: { shortForm: 'h', description: 'Display help information' },
      version: { shortForm: 'v', description: 'Display version information' },
    },
    values: {
      from: { shortForm: 'f', description: 'Source file path', valueRequired: true, kind: 'path' },
      destination: { shortForm: 'o', description: 'Output file path', valueRequired: true, kind: 'path' },
      input: { shortForm: 'i', description: 'Input layer type', valueRequired: true, kind: 'text' },
      adaptation: { shortForm: 'a', description: 'Prompt adaptation type', valueRequired: true, kind: 'text' },
      config: { shortForm: 'c', description: 'Configuration file name', valueRequired: true, kind: 'text' },
      edition: { shortForm: 'e', description: 'Input layer type', valueRequired: true, kind: 'text' },
    },
    userVariables: {
      pattern: '^uv-[a-zA-Z][a-zA-Z0-9_-]*$',
      description: 'User-defined variables (--uv-*)',
    },
  },
  validation: {
    zero: {
      allowedOptions: ['help', 'version'],
      allowedValueOptions: [],
      allowUserVariables: false,
    },
    one: {
      allowedOptions: ['config'],
      allowedValueOptions: ['from', 'destination', 'edition', 'adaptation'],
      allowUserVariables: false,
    },
    two: {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'edition'],
      allowedValueOptions: ['from', 'destination', 'edition', 'adaptation', 'config'],
      allowUserVariables: true,
    },
  },
  errorHandling: {
    unknownOption: 'error',
    duplicateOption: 'error',
    emptyValue: 'error',
  },
  security: {
    policy: 'safe',
  },
};
```

### 3.3 Custom Configuration Example

```typescript
// Custom configuration example
const customConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  params: {
    two: {
      directiveType: {
        pattern: '^(to|from|for)$',  // Allow custom values
        errorMessage: 'Invalid directive type. Must be one of: to, from, for',
      },
      layerType: {
        pattern: '^(module|component|service)$',  // Allow custom values
        errorMessage: 'Invalid layer type. Must be one of: module, component, service',
      },
    },
  },
  validation: {
    ...DEFAULT_CUSTOM_CONFIG.validation,
    two: {
      ...DEFAULT_CUSTOM_CONFIG.validation.two,
      allowedOptions: ['from', 'destination', 'config'],  // Allow only some options
    },
  },
};
```

## 4. Validation Process

### 4.1 Validation with Default Configuration

With default configuration values, only the following values are allowed:

- DirectiveType: `to`, `summary`, `defect`
- LayerType: `project`, `issue`, `task`

### 4.2 Validation with Custom Configuration

With custom configuration values, values matching the pattern specified in configuration are allowed:

1. **DirectiveType Validation**
   - Check if value matches configured pattern
   - Return custom error message if no match

2. **LayerType Validation**
   - Check if value matches configured pattern
   - Return custom error message if no match

## 5. Usage Examples

### 5.1 Parser Initialization

```typescript
import { ParamsParser } from './mod.ts';

// Initialize parser with default configuration
const parser = new ParamsParser();

// Initialize parser with custom configuration
const customParser = new ParamsParser(undefined, undefined, customConfig);
```

### 5.2 Parameter Parsing

```typescript
// Usage with default configuration
const result = parser.parse(['to', 'project', '--from=input.md']);

if (result.type === 'two') {
  console.log(result.params.directiveType); // "to"
  console.log(result.params.layerType); // "project"
  console.log(result.options.from); // "input.md"
}

// Usage with custom configuration
const customResult = customParser.parse(['from', 'module', '--from=src/']);

if (customResult.type === 'two') {
  console.log(customResult.params.directiveType); // "from"
  console.log(customResult.params.layerType); // "module"
  console.log(customResult.options.from); // "src/"
}
```

### 5.3 Configuration Best Practices

#### ❌ Incorrect: Partial Configuration (Will Cause Runtime Error)

```typescript
// DON'T DO THIS - Missing required properties
const partialConfig = {
  params: {
    two: {
      directiveType: { 
        pattern: '^(custom)$', 
        errorMessage: 'Custom error' 
      }
      // Missing layerType, validation, options, errorHandling
    }
  }
};

const parser = new ParamsParser(undefined, partialConfig); // Runtime Error!
// TypeError: Cannot read properties of undefined (reading 'zero')
```

#### ✅ Correct: Using DEFAULT_CUSTOM_CONFIG Spread

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, CustomConfig } from 'jsr:@tettuan/breakdownparams';

// Merge with default configuration for safe partial override
const safeConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,  // Include all default settings
  params: {
    two: {
      directiveType: {
        pattern: '^(create|update|delete)$',
        errorMessage: 'Invalid action. Must be one of: create, update, delete'
      },
      layerType: {
        pattern: '^(user|product|order)$', 
        errorMessage: 'Invalid entity. Must be one of: user, product, order'
      }
    }
  }
};

const parser = new ParamsParser(undefined, safeConfig); // Works perfectly!

// Custom parameters work as expected
const result = parser.parse(['create', 'user']);
// Default validation rules and options are preserved
const resultWithOptions = parser.parse(['update', 'product', '--from=data.json']);
```

#### Key Points:

- **Always use `...DEFAULT_CUSTOM_CONFIG`** when creating custom configurations
- **Partial configurations without defaults will cause runtime errors**
- **Only override the specific parts you need to customize**
- **All other settings (validation, options, errorHandling) inherit from defaults**

## 6. Error Handling

### 6.1 Error Types

1. **Validation Errors**
   - Pattern mismatch
   - Return custom error message

2. **Configuration Errors**
   - Invalid configuration values
   - Pattern syntax errors

### 6.2 Error Messages

```typescript
// Validation error example
{
  type: "error",
  params: [],
  options: {},
  error: {
    message: "Invalid directive type. Must be one of: to, summary, defect",
    code: "INVALID_DIRECTIVE_TYPE",
    category: "validation"
  }
}

// Configuration error example
{
  type: "error",
  params: [],
  options: {},
  error: {
    message: "Invalid configuration: pattern is required",
    code: "INVALID_CONFIGURATION",
    category: "config"
  }
}
```

## 7. Constraints

1. **Pattern Constraints**
   - Must be valid regular expressions
   - Avoid overly complex patterns

2. **Performance**
   - Patterns should be pre-compiled
   - Complex patterns have runtime overhead

3. **Security**
   - Patterns should be appropriately restricted
   - Avoid direct use of user input

## 8. Security Policy

The `security` field controls the parser's built-in path / shell injection enforcement. Behavioural details and the full per-category × per-level matrix live in [Security Validation](development.md#security-validation); this section documents the public types and shows how callers wire them in.

### 8.1 Types

```typescript
// Per-category enforcement strength.
type Level = 'off' | 'safe' | 'strict';

// Five built-in categories. shellInjection is global; the other four apply
// only to value options whose `kind` is 'path'.
type SecurityCategory =
  | 'shellInjection'
  | 'absolutePath'
  | 'homeExpansion'
  | 'parentTraversal'
  | 'specialChars';

// Partial per-category map. Missing keys fall back to the surrounding level.
type SecurityCategoryLevels = Partial<Record<SecurityCategory, Level>>;

// A single Level is shorthand for "apply to every category"; a partial map
// allows per-category tuning.
type SecurityPolicy = Level | SecurityCategoryLevels;

// Classifies how a value option's value is interpreted by Phase 2.
// 'path' opts the value into the four path-related categories.
// 'text' (default) means only Phase 1 shellInjection applies.
type ValueKind = 'path' | 'text';
```

All four types are re-exported from the package entry point alongside `CustomConfig` and `DEFAULT_CUSTOM_CONFIG`.

### 8.2 Caller-defined value option (the `kind` footgun)

Value options registered by the caller default to `kind: 'text'`. Consequence: callers who treat their custom value option as a filesystem path get **no** path-traversal / absolute-path / home-expansion / control-char enforcement on it unless they explicitly opt in.

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

// FOOTGUN: --workspace defaults to kind: 'text' here. ../etc would slip through.
const looseConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      workspace: {
        shortForm: 'w',
        description: 'Workspace directory',
        valueRequired: true,
        // kind omitted → defaults to 'text' → no path checks
      },
    },
  },
};

// FIXED: declare kind: 'path' so Phase 2 enforces the four path categories.
const safeConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      workspace: {
        shortForm: 'w',
        description: 'Workspace directory',
        valueRequired: true,
        kind: 'path',
      },
    },
  },
};
```

### 8.3 Per-option override

Per-option `securityPolicy` overrides only the categories you specify; everything else inherits the global policy. The override is also constrained to the option's `kind`: path-related categories on a `kind: 'text'` option are forced to `'off'` regardless.

Note: `shellInjection` cannot be relaxed per-option. Phase 1 runs before option identity is known, so an override of `shellInjection` on a single option has no effect.

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

const config: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      from: {
        ...DEFAULT_CUSTOM_CONFIG.options.values.from,
        // Allow ~/x and /abs/x for --from only. parentTraversal stays at 'safe'.
        securityPolicy: {
          absolutePath: 'off',
          homeExpansion: 'off',
        },
      },
    },
  },
};

const parser = new ParamsParser(undefined, config);
```

### 8.4 Global strict

Tightening the global policy to `'strict'` extends every category's pattern set. `shellInjection` then also rejects `` ` ``, `$`, newlines, and `$( )`; `parentTraversal` matches URL-encoded `%2e%2e`; and so on.

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

const strictConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  security: {
    policy: 'strict',
  },
};

const parser = new ParamsParser(undefined, strictConfig);
```

### 8.5 Restoring v1.2.x behaviour for `from` / `destination`

Pre-v1.3.0, `--from=/abs/path` and `--from=~/data` were accepted because the parser only ran a global `parentTraversal` check. Default `'safe'` in v1.3.0 rejects them. Callers that need the old leniency can disable just the two newly-enforced categories on the affected options:

```typescript
import { ParamsParser, DEFAULT_CUSTOM_CONFIG, type CustomConfig } from 'jsr:@tettuan/breakdownparams';

const v12CompatConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  options: {
    ...DEFAULT_CUSTOM_CONFIG.options,
    values: {
      ...DEFAULT_CUSTOM_CONFIG.options.values,
      from: {
        ...DEFAULT_CUSTOM_CONFIG.options.values.from,
        securityPolicy: {
          absolutePath: 'off',
          homeExpansion: 'off',
        },
      },
      destination: {
        ...DEFAULT_CUSTOM_CONFIG.options.values.destination,
        securityPolicy: {
          absolutePath: 'off',
          homeExpansion: 'off',
        },
      },
    },
  },
};
```

`parentTraversal`, `specialChars`, and the global `shellInjection` enforcement remain at `'safe'` — they were already enforced (or, in the case of `specialChars`, are new but desirable) and should not need relaxing for v1.2.x compatibility.

## 9. Migration Guide

### 9.1 Migration from Default to Custom Configuration

1. Prepare configuration values
   - Define required patterns
   - Prepare error messages

2. Initialize parser
   - Apply custom configuration values

3. Verify existing code
   - Check error handling
   - Verify return value types

### 9.2 Migration from Custom to Default Configuration

1. Use default configuration values
   - Remove custom configuration values
   - Apply default configuration values

2. Verify parameters
   - Confirm use of default values
   - Replace custom values

---

[日本語版](custom_params.ja.md) | [English Version](custom_params.md)