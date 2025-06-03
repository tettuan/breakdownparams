import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import {
  ParamsResult,
  ZeroParamsResult,
  OneParamResult,
  TwoParamResult,
  ErrorInfo,
  ValidationResult,
  OptionRule,
} from "../../../src/result/types.ts";

Deno.test("test_result_unit", () => {
  // ParamsResultのテスト
  const paramsResult: ParamsResult = {
    type: "zero",
    params: [],
    options: {},
  };
  assertEquals(typeof paramsResult.type, "string", "type should be a string");
  assertEquals(Array.isArray(paramsResult.params), true, "params should be an array");
  assertEquals(typeof paramsResult.options, "object", "options should be an object");

  // ZeroParamsResultのテスト
  const zeroParamsResult: ZeroParamsResult = {
    type: "zero",
    params: [],
    options: {},
  };
  assertEquals(zeroParamsResult.type, "zero", "type should be zero");
  assertEquals(Array.isArray(zeroParamsResult.params), true, "params should be an array");
  assertEquals(typeof zeroParamsResult.options, "object", "options should be an object");

  // OneParamResultのテスト
  const oneParamResult: OneParamResult = {
    type: "one",
    params: ["init"],
    options: {},
    demonstrativeType: "init",
  };
  assertEquals(oneParamResult.type, "one", "type should be one");
  assertEquals(Array.isArray(oneParamResult.params), true, "params should be an array");
  assertEquals(typeof oneParamResult.options, "object", "options should be an object");
  assertEquals(typeof oneParamResult.demonstrativeType, "string", "demonstrativeType should be a string");

  // TwoParamResultのテスト
  const twoParamResult: TwoParamResult = {
    type: "two",
    params: ["to", "project"],
    options: {},
    demonstrativeType: "to",
    layerType: "project",
  };
  assertEquals(twoParamResult.type, "two", "type should be two");
  assertEquals(Array.isArray(twoParamResult.params), true, "params should be an array");
  assertEquals(typeof twoParamResult.options, "object", "options should be an object");
  assertEquals(typeof twoParamResult.demonstrativeType, "string", "demonstrativeType should be a string");
  assertEquals(typeof twoParamResult.layerType, "string", "layerType should be a string");

  // ErrorInfoのテスト
  const errorInfo: ErrorInfo = {
    message: "Test error",
    code: "TEST_ERROR",
    category: "test_category",
  };
  assertEquals(typeof errorInfo.message, "string", "message should be a string");
  assertEquals(typeof errorInfo.code, "string", "code should be a string");
  assertEquals(typeof errorInfo.category, "string", "category should be a string");

  // ValidationResultのテスト
  const validationResult: ValidationResult = {
    isValid: true,
    validatedParams: ["test"],
  };
  assertEquals(typeof validationResult.isValid, "boolean", "isValid should be a boolean");
  assertEquals(Array.isArray(validationResult.validatedParams), true, "validatedParams should be an array");

  // OptionRuleのテスト
  const optionRule: OptionRule = {
    format: "--key=value",
    validation: {
      customVariables: ["--demonstrative-type", "--layer-type"],
      emptyValue: "error",
      unknownOption: "error",
      duplicateOption: "error",
      requiredOptions: [],
      valueTypes: ["string"]
    },
    specialCases: {
      "--help": "help",
      "--version": "version",
    },
  };
  assertEquals(typeof optionRule.format, "string", "format should be a string");
  assertEquals(Array.isArray(optionRule.validation.customVariables), true, "customVariables should be an array");
  assertEquals(typeof optionRule.validation.emptyValue, "string", "emptyValue should be a string");
  assertEquals(typeof optionRule.validation.unknownOption, "string", "unknownOption should be a string");
  assertEquals(typeof optionRule.validation.duplicateOption, "string", "duplicateOption should be a string");
  assertEquals(Array.isArray(optionRule.validation.requiredOptions), true, "requiredOptions should be an array");
  assertEquals(Array.isArray(optionRule.validation.valueTypes), true, "valueTypes should be an array");
  assertEquals(typeof optionRule.specialCases, "object", "specialCases should be an object");
});

Deno.test("test_validation_result", () => {
  // 成功結果のテスト
  const successResult: ValidationResult = {
    isValid: true,
    validatedParams: ["test"],
  };
  assertEquals(successResult.isValid, true, "Success result should be valid");
  assertEquals(successResult.validatedParams, ["test"], "Validated params should match");
  assertEquals(successResult.error, undefined, "Error should be undefined");

  // エラー結果のテスト
  const errorResult: ValidationResult = {
    isValid: false,
    validatedParams: [],
    error: {
      message: "Test error",
      code: "TEST_ERROR",
      category: "test_category",
    },
  };
  assertEquals(errorResult.isValid, false, "Error result should be invalid");
  assertEquals(errorResult.validatedParams, [], "Validated params should be empty");
  assertEquals(errorResult.error?.message, "Test error", "Error message should match");
  assertEquals(errorResult.error?.code, "TEST_ERROR", "Error code should match");
  assertEquals(errorResult.error?.category, "test_category", "Error category should match");

  // オプションルールのテスト
  const optionRule: OptionRule = {
    format: "--key=value",
    validation: {
      customVariables: ["--demonstrative-type", "--layer-type"],
      emptyValue: "error",
      unknownOption: "error",
      duplicateOption: "error",
      requiredOptions: [],
      valueTypes: ["string"]
    },
    specialCases: {
      "--help": "help",
      "--version": "version",
    },
  };

  assertEquals(typeof optionRule.format, "string", "format should be a string");
  assertEquals(Array.isArray(optionRule.validation.customVariables), true, "customVariables should be an array");
  assertEquals(typeof optionRule.validation.emptyValue, "string", "emptyValue should be a string");
  assertEquals(typeof optionRule.validation.unknownOption, "string", "unknownOption should be a string");
  assertEquals(typeof optionRule.validation.duplicateOption, "string", "duplicateOption should be a string");
  assertEquals(Array.isArray(optionRule.validation.requiredOptions), true, "requiredOptions should be an array");
  assertEquals(Array.isArray(optionRule.validation.valueTypes), true, "valueTypes should be an array");
  assertEquals(typeof optionRule.specialCases, "object", "specialCases should be an object");
}); 