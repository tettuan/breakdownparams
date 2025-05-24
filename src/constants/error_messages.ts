/**
 * Error messages for parameter parsing.
 * These messages are used to provide user-friendly error information.
 *
 * @since 1.0.0
 */
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: {
    INVALID_DEMONSTRATIVE_TYPE: 'Invalid demonstrative type: {type}',
    INVALID_LAYER_TYPE: 'Invalid layer type: {type}',
    INVALID_COMMAND: 'Invalid command: {command}',
    INVALID_OPTION: 'Invalid option: {option}',
    INVALID_CUSTOM_VARIABLE_NAME: 'Invalid custom variable name: {name}',
    MISSING_VALUE_FOR_OPTION: 'Missing value for option: {option}',
    MISSING_VALUE_FOR_CUSTOM_VARIABLE: 'Missing value for custom variable: {name}',
    VALUE_TOO_LONG: 'Value too long: {value}',
    TOO_MANY_CUSTOM_VARIABLES: 'Too many custom variables',
    MISSING_REQUIRED_ARGUMENT: 'Missing required argument: {field}',
    INVALID_CUSTOM_VARIABLE: 'Invalid custom variable: {name}',
    TOO_MANY_ARGUMENTS: 'Too many arguments. Maximum 2 arguments are allowed.'
  },
  SECURITY_ERROR: {
    FORBIDDEN_CHARACTER: 'Security error: character \'{char}\' is not allowed in pattern',
    INVALID_PATTERN: 'Security error: invalid pattern'
  },
  CONFIGURATION_ERROR: {
    INVALID_CONFIG: 'Invalid configuration: {message}',
    INVALID_PATTERN: 'Invalid pattern: {pattern}',
    MISSING_PATTERN: 'Pattern is required in extended mode'
  },
  SYNTAX_ERROR: {
    TOO_MANY_ARGUMENTS: 'Too many arguments',
    UNKNOWN_OPTION: 'Unknown option: {option}'
  },
  UNEXPECTED_ERROR: {
    UNEXPECTED: 'Unexpected error: {message}'
  }
} as const;

/**
 * Japanese error messages for parameter parsing.
 * These messages are used to provide user-friendly error information in Japanese.
 *
 * @since 1.0.0
 */
export const ERROR_MESSAGES_JA = {
  VALIDATION_ERROR: {
    INVALID_DEMONSTRATIVE_TYPE: '無効な指示型です: {type}',
    INVALID_LAYER_TYPE: '無効なレイヤー型です: {type}',
    INVALID_COMMAND: '無効なコマンドです: {command}',
    INVALID_OPTION: '無効なオプションです: {option}',
    INVALID_CUSTOM_VARIABLE_NAME: '無効なカスタム変数名です: {name}',
    MISSING_VALUE_FOR_OPTION: 'オプションの値が指定されていません: {option}',
    MISSING_VALUE_FOR_CUSTOM_VARIABLE: 'カスタム変数の値が指定されていません: {name}',
    VALUE_TOO_LONG: '値が長すぎます: {value}',
    TOO_MANY_CUSTOM_VARIABLES: 'カスタム変数が多すぎます',
    MISSING_REQUIRED_ARGUMENT: '必須の引数が指定されていません: {field}',
    INVALID_CUSTOM_VARIABLE: '無効なカスタム変数です: {name}',
    TOO_MANY_ARGUMENTS: '引数が多すぎます。最大2つの引数が許可されています。'
  },
  SECURITY_ERROR: {
    FORBIDDEN_CHARACTER: 'セキュリティエラー: 文字 \'{char}\' はパターンで使用できません',
    INVALID_PATTERN: 'セキュリティエラー: 無効なパターンです'
  },
  CONFIGURATION_ERROR: {
    INVALID_CONFIG: '無効な設定です: {message}',
    INVALID_PATTERN: '無効なパターンです: {pattern}',
    MISSING_PATTERN: '拡張モードではパターンが必要です'
  },
  SYNTAX_ERROR: {
    TOO_MANY_ARGUMENTS: '引数が多すぎます',
    UNKNOWN_OPTION: '不明なオプションです: {option}'
  },
  UNEXPECTED_ERROR: {
    UNEXPECTED: '予期しないエラーが発生しました: {message}'
  }
} as const; 