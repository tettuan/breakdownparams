import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { ErrorFactory } from "../../src/core/errors/error_factory.ts";
import { ErrorCategory, ErrorCode } from "../../src/core/errors/types.ts";

Deno.test("ErrorFactory - createConfigError - with message", () => {
  const message = "Configuration error";
  const result = ErrorFactory.createConfigError(message);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.CONFIGURATION_ERROR);
  assertEquals(result.category, ErrorCategory.CONFIGURATION);
});

Deno.test("ErrorFactory - createConfigError - with message and details", () => {
  const message = "Configuration error";
  const details = { key: "value" };
  const result = ErrorFactory.createConfigError(message, details);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.CONFIGURATION_ERROR);
  assertEquals(result.category, ErrorCategory.CONFIGURATION);
  assertEquals(result.details, details);
});

Deno.test("ErrorFactory - createConfigError - with empty message", () => {
  const message = "";
  const result = ErrorFactory.createConfigError(message);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.CONFIGURATION_ERROR);
  assertEquals(result.category, ErrorCategory.CONFIGURATION);
});

Deno.test("ErrorFactory - createConfigError - with null details", () => {
  const message = "Configuration error";
  const details = undefined;
  const result = ErrorFactory.createConfigError(message, details);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.CONFIGURATION_ERROR);
  assertEquals(result.category, ErrorCategory.CONFIGURATION);
  assertEquals(result.details, undefined);
});

Deno.test("ErrorFactory - createSecurityError - with message", () => {
  const message = "Security error";
  const result = ErrorFactory.createSecurityError(message);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.category, ErrorCategory.SECURITY);
});

Deno.test("ErrorFactory - createSecurityError - with message and details", () => {
  const message = "Security error";
  const details = { key: "value" };
  const result = ErrorFactory.createSecurityError(message, details);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.category, ErrorCategory.SECURITY);
  assertEquals(result.details, details);
});

Deno.test("ErrorFactory - createSecurityError - with empty message", () => {
  const message = "";
  const result = ErrorFactory.createSecurityError(message);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.category, ErrorCategory.SECURITY);
});

Deno.test("ErrorFactory - createSecurityError - with undefined details", () => {
  const message = "Security error";
  const details = undefined;
  const result = ErrorFactory.createSecurityError(message, details);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.SECURITY_ERROR);
  assertEquals(result.category, ErrorCategory.SECURITY);
  assertEquals(result.details, undefined);
});

Deno.test("ErrorFactory - createValidationError - with message", () => {
  const message = "Validation error";
  const result = ErrorFactory.createValidationError(message);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.category, ErrorCategory.VALIDATION);
});

Deno.test("ErrorFactory - createValidationError - with message and details", () => {
  const message = "Validation error";
  const details = { key: "value" };
  const result = ErrorFactory.createValidationError(message, details);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.category, ErrorCategory.VALIDATION);
  assertEquals(result.details, details);
});

Deno.test("ErrorFactory - createValidationError - with empty message", () => {
  const message = "";
  const result = ErrorFactory.createValidationError(message);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.category, ErrorCategory.VALIDATION);
});

Deno.test("ErrorFactory - createValidationError - with complex details object", () => {
  const message = "Validation error";
  const details = {
    field: "name",
    value: "test",
    constraints: ["required", "minLength"]
  };
  const result = ErrorFactory.createValidationError(message, details);
  assertEquals(result.message, message);
  assertEquals(result.code, ErrorCode.VALIDATION_ERROR);
  assertEquals(result.category, ErrorCategory.VALIDATION);
  assertEquals(result.details, details);
});

Deno.test("ErrorFactory - createInvalidOption - with message", () => {
  const option = "--invalid";
  const result = ErrorFactory.createInvalidOption(option);
  assertEquals(result.message, `Invalid option: ${option}`);
  assertEquals(result.code, ErrorCode.INVALID_OPTION);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: option });
});

Deno.test("ErrorFactory - createInvalidOption - with empty option", () => {
  const option = "";
  const result = ErrorFactory.createInvalidOption(option);
  assertEquals(result.message, `Invalid option: ${option}`);
  assertEquals(result.code, ErrorCode.INVALID_OPTION);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: option });
});

Deno.test("ErrorFactory - createInvalidOption - with special characters", () => {
  const option = "--invalid@#$";
  const result = ErrorFactory.createInvalidOption(option);
  assertEquals(result.message, `Invalid option: ${option}`);
  assertEquals(result.code, ErrorCode.INVALID_OPTION);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: option });
});

Deno.test("ErrorFactory - createInvalidOption - with unicode characters", () => {
  const option = "--invalid-日本語";
  const result = ErrorFactory.createInvalidOption(option);
  assertEquals(result.message, `Invalid option: ${option}`);
  assertEquals(result.code, ErrorCode.INVALID_OPTION);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: option });
});

Deno.test("ErrorFactory - createMissingRequiredArgument - with argument name", () => {
  const argument = "name";
  const result = ErrorFactory.createMissingRequiredArgument(argument);
  assertEquals(result.message, `Missing required argument: ${argument}`);
  assertEquals(result.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { argument });
});

Deno.test("ErrorFactory - createMissingRequiredArgument - with empty argument name", () => {
  const argument = "";
  const result = ErrorFactory.createMissingRequiredArgument(argument);
  assertEquals(result.message, `Missing required argument: ${argument}`);
  assertEquals(result.code, ErrorCode.MISSING_REQUIRED_ARGUMENT);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { argument });
});

Deno.test("ErrorFactory - createUnknownOption - with option", () => {
  const option = "--unknown";
  const result = ErrorFactory.createUnknownOption(option);
  assertEquals(result.message, `Unknown option: ${option}`);
  assertEquals(result.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: option });
});

Deno.test("ErrorFactory - createUnknownOption - with empty option", () => {
  const option = "";
  const result = ErrorFactory.createUnknownOption(option);
  assertEquals(result.message, `Unknown option: ${option}`);
  assertEquals(result.code, ErrorCode.UNKNOWN_OPTION);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: option });
});

Deno.test("ErrorFactory - createInvalidCommand - with command", () => {
  const command = "invalid";
  const result = ErrorFactory.createInvalidCommand(command);
  assertEquals(result.message, `Invalid command: ${command}. Must be one of: init`);
  assertEquals(result.code, ErrorCode.INVALID_COMMAND);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { 
    provided: command,
    validCommands: ['init']
  });
});

Deno.test("ErrorFactory - createInvalidCommand - with empty command", () => {
  const command = "";
  const result = ErrorFactory.createInvalidCommand(command);
  assertEquals(result.message, `Invalid command: ${command}. Must be one of: init`);
  assertEquals(result.code, ErrorCode.INVALID_COMMAND);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { 
    provided: command,
    validCommands: ['init']
  });
});

Deno.test("ErrorFactory - createInvalidCustomVariable - with variable", () => {
  const variable = "custom";
  const result = ErrorFactory.createInvalidCustomVariable(variable);
  assertEquals(result.message, `Invalid custom variable: ${variable}`);
  assertEquals(result.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: variable });
});

Deno.test("ErrorFactory - createInvalidCustomVariable - with empty variable", () => {
  const variable = "";
  const result = ErrorFactory.createInvalidCustomVariable(variable);
  assertEquals(result.message, `Invalid custom variable: ${variable}`);
  assertEquals(result.code, ErrorCode.INVALID_CUSTOM_VARIABLE);
  assertEquals(result.category, ErrorCategory.SYNTAX);
  assertEquals(result.details, { provided: variable });
}); 