/**
 * Rules for validating option combinations
 */
export interface OptionCombinationRule {
  /**
   * List of allowed options
   */
  allowedOptions: string[];

  /**
   * List of required options
   */
  requiredOptions?: string[];

  /**
   * Option combination rules
   * Example: { from: ['destination'] } means if 'from' is specified, 'destination' is also required
   */
  combinationRules?: Record<string, string[]>;
}

/**
 * Option combination rules for each parameter type
 */
export interface OptionCombinationRules {
  zero: OptionCombinationRule;
  one: OptionCombinationRule;
  two: OptionCombinationRule;
}

/**
 * Default option combination rules
 */
export const DEFAULT_OPTION_COMBINATION_RULES: OptionCombinationRules = {
  zero: {
    allowedOptions: ['help', 'version'],
  },
  one: {
    allowedOptions: ['config'],
  },
  two: {
    allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input'],
  },
};
