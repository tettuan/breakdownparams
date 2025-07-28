/**
 * Option validation rules
 */
export interface OptionRule {
  /**
   * Basic option format
   * Currently only supports '--key=value'
   */
  format: '--key=value';

  /**
   * Flag option definitions
   * Options without values (e.g., --help, --version)
   */
  flagOptions: {
    [key: string]: boolean;
  };

  /**
   * Validation rules
   */
  rules: {
    /**
     * User variable definitions
     * Example: ['--uv-config', '--uv-env']
     */
    userVariables: string[];

    /**
     * Required option definitions
     * Example: ['--input', '--output']
     */
    requiredOptions: string[];

    /**
     * Value type definitions
     * Example: ['string', 'number']
     */
    valueTypes: ('string' | 'number' | 'boolean')[];
  };

  /**
   * Error handling settings
   */
  errorHandling: {
    /**
     * Empty value handling
     * error: Treat as error
     * warning: Treat as warning
     * ignore: Ignore
     */
    emptyValue: 'error' | 'warning' | 'ignore';

    /**
     * Unknown option handling
     * error: Treat as error
     * warning: Treat as warning
     * ignore: Ignore
     */
    unknownOption: 'error' | 'warning' | 'ignore';

    /**
     * Duplicate option handling
     * error: Treat as error
     * warning: Treat as warning
     * ignore: Ignore
     */
    duplicateOption: 'error' | 'warning' | 'ignore';
  };
}

/**
 * Default option rules
 */
export const DEFAULT_OPTION_RULE: OptionRule = {
  format: '--key=value',
  flagOptions: {
    help: true,
    version: true,
  },
  rules: {
    userVariables: [],
    requiredOptions: [],
    valueTypes: ['string'],
  },
  errorHandling: {
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
  },
};
