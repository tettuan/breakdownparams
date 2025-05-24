import { describe, it, expect } from 'vitest';
import { ConfigValidator } from '../../../src/validators/config_validator';
import { ParserConfig } from '../../../src/types';

describe('ConfigValidator', () => {
  const validator = new ConfigValidator();

  describe('validate', () => {
    it('should return null for valid config in standard mode', () => {
      const config: ParserConfig = {
        isExtendedMode: false
      };
      expect(validator.validate(config)).toBeNull();
    });

    it('should return null for valid config in extended mode with pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '^[a-z]+$'
        }
      };
      expect(validator.validate(config)).toBeNull();
    });

    it('should return error for extended mode without pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true
      };
      const result = validator.validate(config);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CONFIG');
      expect(result?.message).toContain('pattern is required');
    });

    it('should return error for invalid pattern in extended mode', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '[invalid'
        }
      };
      const result = validator.validate(config);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CONFIG');
      expect(result?.message).toContain('invalid pattern');
    });

    it('should return null for empty config object', () => {
      const config: ParserConfig = {};
      expect(validator.validate(config)).toBeNull();
    });

    it('should return null for config with undefined isExtendedMode', () => {
      const config: ParserConfig = {
        isExtendedMode: undefined
      };
      expect(validator.validate(config)).toBeNull();
    });

    it('should return error for extended mode with empty pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: ''
        }
      };
      const result = validator.validate(config);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CONFIG');
      expect(result?.message).toContain('pattern is required');
    });

    it('should return error for extended mode with whitespace pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '   '
        }
      };
      const result = validator.validate(config);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CONFIG');
      expect(result?.message).toContain('pattern is required');
    });

    it('should return error for extended mode with undefined pattern', () => {
      const config: ParserConfig = {
        isExtendedMode: true,
        demonstrativeType: {
          pattern: undefined
        }
      };
      const result = validator.validate(config);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CONFIG');
      expect(result?.message).toContain('pattern is required');
    });
  });
}); 