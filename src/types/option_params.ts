/**
 * Type for parsed options
 */
export interface OptionParams {
  /**
   * Source file path
   */
  fromFile?: string;

  /**
   * Output file path
   */
  destinationFile?: string;

  /**
   * Input layer type
   */
  fromLayerType?: string;

  /**
   * Prompt adaptation type
   */
  adaptationType?: string;

  /**
   * Configuration file name
   */
  configFile?: string;

  /**
   * Custom variables
   */
  customVariables?: Record<string, string>;
} 