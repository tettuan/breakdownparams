import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { SecurityErrorValidator } from "../../../src/core/errors/validators/security_error_validator.ts";
import { ErrorCategory, ErrorCode } from "../../../src/core/errors/types.ts";

Deno.test("SecurityErrorValidator", async (t) => {
  const validator = new SecurityErrorValidator();

  await t.step("should detect command injection patterns", () => {
    const result = validator.validate(["test;ls"]);
    assertExists(result.error);
    assertEquals(result.error.code, ErrorCode.SECURITY_ERROR);
    assertEquals(result.error.category, ErrorCategory.SECURITY);
  });

  await t.step("should detect path traversal patterns", () => {
    const result = validator.validate(["test/../etc/passwd"]);
    assertExists(result.error);
    assertEquals(result.error.code, ErrorCode.SECURITY_ERROR);
    assertEquals(result.error.category, ErrorCategory.SECURITY);
  });

  await t.step("should detect shell metacharacters", () => {
    const result = validator.validate(["test`ls`"]);
    assertExists(result.error);
    assertEquals(result.error.code, ErrorCode.SECURITY_ERROR);
    assertEquals(result.error.category, ErrorCategory.SECURITY);
  });

  await t.step("should pass valid input", () => {
    const result = validator.validate(["valid-input"]);
    assertEquals(result.success, true);
  });
}); 