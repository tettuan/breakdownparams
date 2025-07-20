/**
 * Base interface for all parameter parsing results.
 *
 * This interface serves as the foundation for the discriminated union pattern
 * used to represent different parsing outcomes. It ensures type safety by
 * requiring consumers to check the 'type' field before accessing specific properties.
 *
 * The design follows the Result pattern, encapsulating both successful parsing
 * outcomes and error states in a unified structure.
 */
export interface ParamsResult {
  /**
   * Discriminator field indicating the parsing result type.
   *
   * This field enables TypeScript's discriminated union feature, allowing
   * type-safe access to result-specific properties based on the type value.
   * - 'zero': No parameters provided (command only)
   * - 'one': Single parameter with directive type
   * - 'two': Two parameters with directive and layer types
   * - 'error': Parsing or validation error occurred
   */
  type: 'zero' | 'one' | 'two' | 'error';
  /**
   * Array of parsed parameter values.
   *
   * Contains the positional arguments extracted from the command line,
   * excluding options. The array length corresponds to the 'type' field:
   * - zero: empty array []
   * - one: single element array [param]
   * - two: two element array [param1, param2]
   * - error: may contain partial results for debugging
   */
  params: string[];
  /**
   * Parsed option values as key-value pairs.
   *
   * Contains all successfully parsed options, regardless of the parameter
   * parsing outcome. Keys are normalized option names, values are the
   * parsed option values (string, boolean, or custom types).
   */
  options: Record<string, unknown>;
  /**
   * Error information when parsing fails.
   *
   * Only present when type is 'error'. Contains detailed information
   * about what went wrong during parsing or validation.
   */
  error?: ErrorInfo;
}

/**
 * Result type for commands with no parameters.
 *
 * Represents the successful parsing of a command that expects no positional
 * arguments, only options. This is typically used for commands that perform
 * default actions or rely entirely on options for configuration.
 *
 * Example usage: command --verbose --output=file.txt
 */
export interface ZeroParamsResult extends ParamsResult {
  /**
   * Type discriminator indicating no parameters.
   *
   * When this type is 'zero', the params array will always be empty,
   * and only options may contain values.
   */
  type: 'zero';
}

/**
 * Result type for commands with a single parameter.
 *
 * Represents the successful parsing of a command that expects exactly one
 * positional argument. The parameter is categorized by its directive type,
 * which indicates the parameter's role or meaning in the command context.
 *
 * Example usage: command <target> --options
 */
export interface OneParamsResult extends ParamsResult {
  /**
   * Type discriminator indicating single parameter.
   *
   * When this type is 'one', the params array will contain exactly
   * one element, and directiveType will be populated.
   */
  type: 'one';
  /**
   * The semantic category of the parameter.
   *
   * Indicates what the parameter represents in the command context,
   * such as 'file', 'url', 'identifier', etc. This classification
   * helps in understanding the parameter's intended use and may
   * influence subsequent processing or validation.
   */
  directiveType: string;
}

/**
 * Result type for commands with two parameters.
 *
 * Represents the successful parsing of a command that expects exactly two
 * positional arguments. Both parameters are categorized: the first by its
 * directive type and the second by its layer type, enabling rich
 * semantic understanding of the command structure.
 *
 * Example usage: command <source> <destination> --options
 */
export interface TwoParamsResult extends ParamsResult {
  /**
   * Type discriminator indicating two parameters.
   *
   * When this type is 'two', the params array will contain exactly
   * two elements, with both directiveType and layerType populated.
   */
  type: 'two';
  /**
   * The semantic category of the first parameter.
   *
   * Similar to OneParamsResult, indicates what the first parameter
   * represents (e.g., 'source', 'input', 'from').
   */
  directiveType: string;
  /**
   * The semantic category of the second parameter.
   *
   * Indicates the role or layer of the second parameter in relation
   * to the first (e.g., 'destination', 'output', 'target'). This
   * helps establish the relationship between the two parameters.
   */
  layerType: string;
}

/**
 * Result type for parsing or validation errors.
 *
 * Represents a failed parsing attempt, containing both the partial results
 * (what could be parsed) and detailed error information. This allows for
 * better error reporting and potential recovery strategies.
 *
 * Note: Unlike ParamsResult, the error field is required here, not optional.
 */
export interface ErrorResult {
  /**
   * Type discriminator indicating an error occurred.
   *
   * When this type is 'error', the error field will always be present
   * with detailed information about the failure.
   */
  type: 'error';
  /**
   * Partially parsed parameters before the error.
   *
   * May contain successfully parsed parameters up to the point of failure,
   * useful for debugging and providing context in error messages.
   */
  params: string[];
  /**
   * Successfully parsed options before the error.
   *
   * Options that were successfully parsed before encountering the error,
   * allowing partial results to be examined.
   */
  options: Record<string, unknown>;
  /**
   * Detailed error information.
   *
   * Required field containing comprehensive error details including
   * message, code, and category for proper error handling.
   */
  error: ErrorInfo;
}

/**
 * Structured error information for parameter parsing failures.
 *
 * This interface defines the error information returned to users as the final
 * result of parameter parsing. Internal processing errors are transformed into
 * this format before being returned to maintain a consistent error interface.
 *
 * Errors can occur at three distinct levels during parsing:
 * 1. Parameter errors: Invalid parameter format or values
 * 2. Option errors: Invalid option format or values
 * 3. Combination errors: Invalid combinations of parameters and options
 *
 * Error information is created by the ParamsParser and returned to users.
 * Direct error information from validators is prohibited to maintain proper
 * abstraction and error message consistency.
 *
 * The structured format enables programmatic error handling while providing
 * human-readable messages for end users.
 */
export interface ErrorInfo {
  /**
   * Human-readable error description.
   *
   * Provides a clear, user-friendly explanation of what went wrong.
   * Should be suitable for display to end users without exposing
   * internal implementation details.
   */
  message: string;
  /**
   * Machine-readable error identifier.
   *
   * A stable error code that can be used for programmatic error handling,
   * internationalization, or mapping to documentation. Follows a consistent
   * naming convention (e.g., 'PARAM_REQUIRED', 'INVALID_OPTION_VALUE').
   */
  code: string;
  /**
   * Error classification for grouping related errors.
   *
   * Indicates the error's origin or type (e.g., 'validation', 'parsing',
   * 'security'). Useful for error handling strategies and logging.
   */
  category: string;
}
