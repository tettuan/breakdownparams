import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { ParamsParser } from "../../src/parser/params_parser.ts";
import { OptionRule } from "../../src/result/types.ts";

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: '--uv-*',
    emptyValue: false,
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  specialCases: {
    '-c=value': 'configFile',
    '--config=value': 'configFile',
  },
};

Deno.test("test_params_parser_interface", () => {
  const parser = new ParamsParser(optionRule);
  assertEquals(typeof parser.parse, "function");
});

Deno.test("test_params_parser_constructor", () => {
  const parser = new ParamsParser(optionRule);
  assertEquals(parser instanceof ParamsParser, true);
}); 