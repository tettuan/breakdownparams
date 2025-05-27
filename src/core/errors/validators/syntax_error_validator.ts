/**
 * Validates input for syntax-related issues
 * Checks for proper formatting and structure
 */
export class SyntaxErrorValidator {
  /**
   * Validates an option string for proper syntax
   * @param option The option string to validate
   * @returns true if the option has syntax issues, false otherwise
   */
  public validateOption(option: string): boolean {
    // Check for proper option format
    if (!option.startsWith('--') && !option.startsWith('-')) {
      return true;
    }

    // Check for empty option name
    if (option === '--' || option === '-') {
      return true;
    }

    // Check for proper value assignment format
    if (option.includes('=')) {
      const [key, value] = option.split('=');
      if (!key || value === undefined) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validates a command string for proper syntax
   * @param command The command string to validate
   * @returns true if the command has syntax issues, false otherwise
   */
  public validateCommand(command: string): boolean {
    // Check for empty command
    if (!command || command.trim() === '') {
      return true;
    }

    // Check for proper command format (alphanumeric only)
    if (!/^[a-z0-9]+$/.test(command)) {
      return true;
    }

    return false;
  }
}
