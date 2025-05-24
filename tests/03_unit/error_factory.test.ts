import { describe, it, expect } from 'vitest';
import { ErrorFactory } from '../../src/error_factory';
import { ErrorCategory, ErrorCode } from '../../src/types';

describe('ErrorFactory', () => {
  describe('createConfigError', () => {
    it('should create config error with message', () => {
      const message = 'Invalid configuration';
      const result = ErrorFactory.createConfigError(message);
      expect(result).toEqual({
        message,
        code: ErrorCode.INVALID_CONFIG,
        category: ErrorCategory.CONFIGURATION
      });
    });

    it('should create config error with message and details', () => {
      const message = 'Invalid configuration';
      const details = { pattern: 'invalid' };
      const result = ErrorFactory.createConfigError(message, details);
      expect(result).toEqual({
        message,
        code: ErrorCode.INVALID_CONFIG,
        category: ErrorCategory.CONFIGURATION,
        details
      });
    });

    it('should create config error with empty message', () => {
      const message = '';
      const result = ErrorFactory.createConfigError(message);
      expect(result).toEqual({
        message,
        code: ErrorCode.INVALID_CONFIG,
        category: ErrorCategory.CONFIGURATION
      });
    });

    it('should create config error with null details', () => {
      const message = 'Invalid configuration';
      const details = null;
      const result = ErrorFactory.createConfigError(message, details);
      expect(result).toEqual({
        message,
        code: ErrorCode.INVALID_CONFIG,
        category: ErrorCategory.CONFIGURATION,
        details
      });
    });
  });

  describe('createSecurityError', () => {
    it('should create security error with message', () => {
      const message = 'Security violation';
      const result = ErrorFactory.createSecurityError(message);
      expect(result).toEqual({
        message,
        code: ErrorCode.SECURITY_ERROR,
        category: ErrorCategory.SECURITY
      });
    });

    it('should create security error with message and details', () => {
      const message = 'Security violation';
      const details = { pattern: 'invalid' };
      const result = ErrorFactory.createSecurityError(message, details);
      expect(result).toEqual({
        message,
        code: ErrorCode.SECURITY_ERROR,
        category: ErrorCategory.SECURITY,
        details
      });
    });

    it('should create security error with empty message', () => {
      const message = '';
      const result = ErrorFactory.createSecurityError(message);
      expect(result).toEqual({
        message,
        code: ErrorCode.SECURITY_ERROR,
        category: ErrorCategory.SECURITY
      });
    });

    it('should create security error with undefined details', () => {
      const message = 'Security violation';
      const details = undefined;
      const result = ErrorFactory.createSecurityError(message, details);
      expect(result).toEqual({
        message,
        code: ErrorCode.SECURITY_ERROR,
        category: ErrorCategory.SECURITY
      });
    });
  });

  describe('createValidationError', () => {
    it('should create validation error with message', () => {
      const message = 'Validation failed';
      const result = ErrorFactory.createValidationError(message);
      expect(result).toEqual({
        message,
        code: ErrorCode.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION
      });
    });

    it('should create validation error with message and details', () => {
      const message = 'Validation failed';
      const details = { value: 'invalid' };
      const result = ErrorFactory.createValidationError(message, details);
      expect(result).toEqual({
        message,
        code: ErrorCode.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION,
        details
      });
    });

    it('should create validation error with empty message', () => {
      const message = '';
      const result = ErrorFactory.createValidationError(message);
      expect(result).toEqual({
        message,
        code: ErrorCode.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION
      });
    });

    it('should create validation error with complex details object', () => {
      const message = 'Validation failed';
      const details = {
        value: 'invalid',
        constraints: ['min', 'max'],
        context: { field: 'age', min: 0, max: 120 }
      };
      const result = ErrorFactory.createValidationError(message, details);
      expect(result).toEqual({
        message,
        code: ErrorCode.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION,
        details
      });
    });
  });
}); 