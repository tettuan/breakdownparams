import { assertEquals, assertExists } from "https://deno.land/std/assert/mod.ts";
import { ConfigValidator } from '../../../src/validators/config_validator.ts';
import { ParserConfig } from '../../../src/types.ts';

Deno.test('ConfigValidator', async (t) => {
  const validator = new ConfigValidator();

  await t.step('validate', async (t) => {
    await t.step('should return null for valid config in standard mode', () => {
      const config: ParserConfig = {
        isExtendedMode: false
      };
      assertEquals(validator.validate(config), null);
    });

    await t.step('should return null for valid config in extended mode with pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '^[a-z]+$'
        }
      };
      assertEquals(validator.validate(config), null);
    });

    await t.step('should return error for extended mode without pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true
      };
      const result = validator.validate(config);
      assertExists(result);
      assertEquals(result.code, 'INVALID_CONFIG');
      assertEquals(result.message.includes('pattern is required'), true);
    });

    await t.step('should return error for invalid pattern in extended mode', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '[invalid'
        }
      };
      const result = validator.validate(config);
      assertExists(result);
      assertEquals(result.code, 'INVALID_CONFIG');
      assertEquals(result.message.includes('invalid pattern'), true);
    });

    await t.step('should return null for empty config object', () => {
      const config: ParserConfig = {};
      assertEquals(validator.validate(config), null);
    });

    await t.step('should return null for config with undefined isExtendedMode', () => {
      const config: ParserConfig = {
        isExtendedMode: undefined
      };
      assertEquals(validator.validate(config), null);
    });

    await t.step('should return error for extended mode with empty pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: ''
        }
      };
      const result = validator.validate(config);
      assertExists(result);
      assertEquals(result.code, 'INVALID_CONFIG');
      assertEquals(result.message.includes('pattern is required'), true);
    });

    await t.step('should return error for extended mode with whitespace pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '   '
        }
      };
      const result = validator.validate(config);
      assertExists(result);
      assertEquals(result.code, 'INVALID_CONFIG');
      assertEquals(result.message.includes('pattern is required'), true);
    });

    await t.step('should return error for extended mode with undefined pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: undefined
        }
      };
      const result = validator.validate(config);
      assertExists(result);
      assertEquals(result.code, 'INVALID_CONFIG');
      assertEquals(result.message.includes('pattern is required'), true);
    });
  });
}); 