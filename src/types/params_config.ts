/**
 * Configuration for two parameters validation rules
 * Used only in TwoParamsValidator for validating demonstrativeType and layerType
 */
export interface TwoParamsConfig {
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
 * Default configuration for two parameters validation rules
 */
export const DEFAULT_TWO_PARAMS_CONFIG: TwoParamsConfig = {
  demonstrativeType: {
    pattern: '^(to|summary|defect)$',
    errorMessage: 'Invalid demonstrative type. Must be one of: to, summary, defect'
  },
  layerType: {
    pattern: '^(project|issue|task)$',
    errorMessage: 'Invalid layer type. Must be one of: project, issue, task'
  }
}; 