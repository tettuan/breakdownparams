/**
 * Custom configuration types for breakdownparams
 */

/**
 * Directive type configuration
 */
export interface DirectiveTypeConfig {
  pattern: string;
  errorMessage: string;
}

/**
 * Layer type configuration
 */
export interface LayerTypeConfig {
  pattern: string;
  errorMessage: string;
}

/**
 * Parameter configuration for two-parameter mode
 */
export interface ParamsConfig {
  directiveType: DirectiveTypeConfig;
  layerType: LayerTypeConfig;
}

/**
 * Option definition
 */
export interface OptionDefinition {
  shortForm?: string;
  description: string;
  valueRequired?: boolean;
}

/**
 * User variable configuration
 */
export interface UserVariableConfig {
  pattern: string;
  description: string;
}

/**
 * Option definitions
 */
export interface OptionsDefinitions {
  flags: Record<string, OptionDefinition>;
  values: Record<string, OptionDefinition>;
  userVariables: UserVariableConfig;
}

/**
 * Validation rules for a parameter mode
 */
export interface ValidationRules {
  allowedOptions: string[];
  allowedValueOptions?: string[];
  allowUserVariables: boolean;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  unknownOption: 'error' | 'ignore' | 'warn';
  duplicateOption: 'error' | 'ignore' | 'warn';
  emptyValue: 'error' | 'ignore' | 'warn';
}

/**
 * Complete custom configuration
 */
export interface CustomConfig {
  params: {
    two: ParamsConfig;
  };
  options: OptionsDefinitions;
  validation: {
    zero: ValidationRules;
    one: ValidationRules;
    two: ValidationRules;
  };
  errorHandling: ErrorHandlingConfig;
}

/**
 * Default custom configuration
 */
export const DEFAULT_CUSTOM_CONFIG: CustomConfig = {
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
      help: {
        shortForm: 'h',
        description: 'Display help information',
      },
      version: {
        shortForm: 'v',
        description: 'Display version information',
      },
    },
    values: {
      from: {
        shortForm: 'f',
        description: 'Source file path',
        valueRequired: true,
      },
      destination: {
        shortForm: 'o',
        description: 'Output file path',
        valueRequired: true,
      },
      input: {
        shortForm: 'i',
        description: 'Input layer type (alias for edition)',
        valueRequired: true,
      },
      adaptation: {
        shortForm: 'a',
        description: 'Prompt adaptation type',
        valueRequired: true,
      },
      config: {
        shortForm: 'c',
        description: 'Configuration file name',
        valueRequired: true,
      },
      edition: {
        shortForm: 'e',
        description: 'Input layer type',
        valueRequired: true,
      },
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
      allowedValueOptions: ['from', 'destination', 'input', 'adaptation', 'edition'],
      allowUserVariables: false,
    },
    two: {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input', 'edition'],
      allowedValueOptions: ['from', 'destination', 'input', 'adaptation', 'config', 'edition'],
      allowUserVariables: true,
    },
  },
  errorHandling: {
    unknownOption: 'error',
    duplicateOption: 'error',
    emptyValue: 'error',
  },
};
