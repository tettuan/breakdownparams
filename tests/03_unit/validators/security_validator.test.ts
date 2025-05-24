import { describe, it, expect } from 'vitest';
import { SecurityValidator } from '../../../src/validators/security_validator';

describe('SecurityValidator', () => {
  const validator = new SecurityValidator();

  describe('validatePattern', () => {
    it('should return null for valid pattern', () => {
      const pattern = '^[a-z]+$';
      expect(validator.validatePattern(pattern)).toBeNull();
    });

    it('should return error for pattern containing semicolon', () => {
      const pattern = '^[a-z;]+$';
      const result = validator.validatePattern(pattern);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('SECURITY_ERROR');
      expect(result?.message).toContain(';');
    });

    it('should return error for pattern containing ampersand', () => {
      const pattern = '^[a-z&]+$';
      const result = validator.validatePattern(pattern);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('SECURITY_ERROR');
      expect(result?.message).toContain('&');
    });

    it('should return error for pattern containing backtick', () => {
      const pattern = '^[a-z`]+$';
      const result = validator.validatePattern(pattern);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('SECURITY_ERROR');
      expect(result?.message).toContain('`');
    });

    it('should return error for pattern containing multiple forbidden characters', () => {
      const pattern = '^[a-z;&`]+$';
      const result = validator.validatePattern(pattern);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('SECURITY_ERROR');
      expect(result?.message).toContain(';');
      expect(result?.message).toContain('&');
      expect(result?.message).toContain('`');
    });

    it('should return null for empty pattern', () => {
      const pattern = '';
      expect(validator.validatePattern(pattern)).toBeNull();
    });

    it('should return null for whitespace pattern', () => {
      const pattern = '   ';
      expect(validator.validatePattern(pattern)).toBeNull();
    });

    it('should return null for pattern with only allowed characters', () => {
      const pattern = '^[a-zA-Z0-9_-]+$';
      expect(validator.validatePattern(pattern)).toBeNull();
    });

    it('should return error for pattern with escaped forbidden characters', () => {
      const pattern = '^[a-z\\;\\&\\`]+$';
      const result = validator.validatePattern(pattern);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('SECURITY_ERROR');
    });

    it('should return error for pattern with unicode forbidden characters', () => {
      const pattern = '^[a-z\u003B\u0026\u0060]+$';
      const result = validator.validatePattern(pattern);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('SECURITY_ERROR');
    });

    it('should return error for pattern with mixed case forbidden characters', () => {
      const pattern = '^[a-z;A-Z&`]+$';
      const result = validator.validatePattern(pattern);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('SECURITY_ERROR');
    });
  });
}); 