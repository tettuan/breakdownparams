/**
 * Configuration for parameter validation rules
 */
export interface ParserConfig {
  /**
   * DemonstrativeType configuration
   */
  demonstrativeType?: {
    /**
     * Pattern for validating demonstrative type
     * @default "^(to|summary|defect)$"
     */
    pattern?: string;
    /**
     * Custom error message for demonstrative type validation
     * @default "Invalid demonstrative type. Must be one of: to, summary, defect"
     */
    errorMessage?: string;
  };

  /**
   * LayerType configuration
   */
  layerType?: {
    /**
     * Pattern for validating layer type
     * @default "^(project|issue|task)$"
     */
    pattern?: string;
    /**
     * Custom error message for layer type validation
     * @default "Invalid layer type. Must be one of: project, issue, task"
     */
    errorMessage?: string;
  };
}

/**
 * Default configuration for parameter validation rules
 */
export const DEFAULT_CONFIG: ParserConfig = {
  demonstrativeType: {
    pattern: '^(to|summary|defect)$',
    errorMessage: 'Invalid demonstrative type. Must be one of: to, summary, defect'
  },
  layerType: {
    pattern: '^(project|issue|task)$',
    errorMessage: 'Invalid layer type. Must be one of: project, issue, task'
  }
}; 