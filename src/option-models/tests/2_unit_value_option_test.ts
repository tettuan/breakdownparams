import { assert, assertEquals } from "jsr:@std/assert@^0.218.2";
import { ValueOption } from "../value_option.ts";

Deno.test("ValueOption Unit Tests", async (t) => {
  const valueOption = new ValueOption(
    "--test",
    ["-t"],
    true,
    "Test value option",
    (value) => ({
      isValid: value.length > 0,
      validatedParams: [value],
      errorMessage: value.length === 0 ? "Value cannot be empty" : undefined
    })
  );

  await t.step("should handle required value correctly", () => {
    const result = valueOption.validate("value");
    assert(result.isValid);
    assertEquals(result.validatedParams, ["value"]);
    assertEquals(valueOption.parse("value"), "value");
  });

  await t.step("should handle optional value correctly", () => {
    const optionalOption = new ValueOption(
      "--test",
      ["-t"],
      false,
      "Test value option",
      (value) => ({
        isValid: true,
        validatedParams: value ? [value] : [],
        errorMessage: undefined
      })
    );
    const result = optionalOption.validate(undefined);
    assert(result.isValid);
    assertEquals(result.validatedParams, []);
    assertEquals(optionalOption.parse(undefined), undefined);
  });

  await t.step("should handle empty value correctly", () => {
    const result = valueOption.validate("");
    assert(!result.isValid);
    assertEquals(result.validatedParams, []);
    assert(result.errorMessage?.includes("Value cannot be empty"));
  });

  await t.step("should handle custom validator correctly", () => {
    const customValidator = (value: string) => ({
      isValid: value === "valid",
      validatedParams: [value],
      errorMessage: value !== "valid" ? "Invalid value" : undefined
    });
    const customOption = new ValueOption(
      "--test",
      ["-t"],
      true,
      "Test value option",
      customValidator
    );
    const result = customOption.validate("valid");
    assert(result.isValid);
    assertEquals(result.validatedParams, ["valid"]);
    assertEquals(customOption.parse("valid"), "valid");
  });

  await t.step("should handle short form value correctly", () => {
    const result = valueOption.validate("-t=value");
    assert(result.isValid);
    assertEquals(result.validatedParams, ["value"]);
    assertEquals(valueOption.parse("-t=value"), "value");
  });

  await t.step("should handle long form value correctly", () => {
    const result = valueOption.validate("--test=value");
    assert(result.isValid);
    assertEquals(result.validatedParams, ["value"]);
    assertEquals(valueOption.parse("--test=value"), "value");
  });
}); 