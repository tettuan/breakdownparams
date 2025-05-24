import { describe, it, expect } from 'vitest';
import { ParamsParser } from '../../src/params_parser.ts';
import { ConfigValidator } from '../../src/validators/config_validator.ts';
import { SecurityValidator } from '../../src/validators/security_validator.ts';
import { ERROR_MESSAGES } from '../../src/constants/error_messages.ts';
import { ErrorCode, ErrorCategory } from '../../src/constants/error_codes.ts';

describe('ParamsParser', () => {
  describe('parse', () => {
    it('should parse no params with help flag', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['--help']);
      expect(result.type).toBe('no-params');
      expect(result.help).toBe(true);
      expect(result.version).toBe(false);
    });

    it('should parse no params with version flag', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['--version']);
      expect(result.type).toBe('no-params');
      expect(result.help).toBe(false);
      expect(result.version).toBe(true);
    });

    it('should parse single param with init command', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['init']);
      expect(result.type).toBe('single');
      expect(result.command).toBe('init');
      expect(result.options).toEqual({});
    });

    it('should return error for invalid single param', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['invalid']);
      expect(result.type).toBe('single');
      expect(result.error?.message).toContain('Invalid command: invalid');
    });

    it('should parse double params with valid types', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['to', 'project']);
      expect(result.type).toBe('double');
      expect(result.demonstrativeType).toBe('to');
      expect(result.layerType).toBe('project');
      expect(result.options).toEqual({});
    });

    it('should return error for invalid demonstrative type', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['invalid', 'project']);
      expect(result.type).toBe('double');
      expect(result.error?.message).toContain('Invalid demonstrative type: invalid');
    });

    it('should return error for invalid layer type', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['to', 'invalid']);
      expect(result.type).toBe('double');
      expect(result.error?.message).toContain('Invalid layer type: invalid');
    });

    it('should return error for too many arguments', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['to', 'project', 'extra']);
      expect(result.type).toBe('double');
      expect(result.error?.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR.TOO_MANY_ARGUMENTS);
    });

    describe('extended mode', () => {
      it('should validate with custom pattern', () => {
        const parser = new ParamsParser({
          isExtendedMode: true,
          demonstrativeType: {
            pattern: '^[a-z]+$'
          }
        });
        const result = parser.parse(['custom', 'project']);
        expect(result.type).toBe('double');
        expect(result.demonstrativeType).toBe('custom');
        expect(result.layerType).toBe('project');
      });

      it('should return error for invalid pattern in extended mode', () => {
        const parser = new ParamsParser({
          isExtendedMode: true,
          demonstrativeType: {
            pattern: '[invalid'
          }
        });
        const result = parser.parse(['to', 'project']);
        expect(result.type).toBe('double');
        expect(result.error?.message).toContain('invalid pattern');
      });

      it('should return error for pattern with forbidden characters', () => {
        const parser = new ParamsParser({
          isExtendedMode: true,
          demonstrativeType: {
            pattern: '^[a-z;]+$'
          }
        });
        const result = parser.parse(['to', 'project']);
        expect(result.type).toBe('double');
        expect(result.error?.message).toContain('Security error');
      });
    });

    describe('options', () => {
      it('should parse standard options', () => {
        const parser = new ParamsParser();
        const result = parser.parse(['to', 'project', '--from=input.txt', '--destination=output.txt']);
        expect(result.type).toBe('double');
        expect(result.options.fromFile).toBe('input.txt');
        expect(result.options.destinationFile).toBe('output.txt');
      });

      it('should parse custom variable options', () => {
        const parser = new ParamsParser();
        const result = parser.parse(['to', 'project', '--uv-name=value']);
        expect(result.type).toBe('double');
        expect(result.options.customVariables?.name).toBe('value');
      });

      it('should return error for invalid option', () => {
        const parser = new ParamsParser();
        const result = parser.parse(['to', 'project', '--invalid']);
        expect(result.type).toBe('double');
        expect(result.error?.message).toContain('Invalid option');
      });
    });
  });

  describe('parseNonOptionArgs', () => {
    it('should extract non-option arguments', () => {
      const parser = new ParamsParser();
      const args = ['command', '--option=value', 'arg'];
      const result = parser['parseNonOptionArgs'](args);
      expect(result).toEqual(['command', 'arg']);
    });

    it('should handle custom variable options', () => {
      const parser = new ParamsParser();
      const args = ['command', '--uv-name=value', '--uv-type=test', 'arg'];
      const result = parser['parseNonOptionArgs'](args);
      expect(result).toEqual(['command', 'arg']);
    });

    it('should handle empty arguments', () => {
      const parser = new ParamsParser();
      const args: string[] = [];
      const result = parser['parseNonOptionArgs'](args);
      expect(result).toEqual([]);
    });

    it('should handle only option arguments', () => {
      const parser = new ParamsParser();
      const args = ['--help', '--version'];
      const result = parser['parseNonOptionArgs'](args);
      expect(result).toEqual([]);
    });

    it('should handle mixed arguments', () => {
      const parser = new ParamsParser();
      const args = ['--help', 'command', '--option=value', '--uv-name=test', 'arg'];
      const result = parser['parseNonOptionArgs'](args);
      expect(result).toEqual(['command', 'arg']);
    });
  });

  describe('parseNoParams', () => {
    it('should parse help flag', () => {
      const parser = new ParamsParser();
      const args = ['--help'];
      const result = parser['parseNoParams'](args);
      expect(result.help).toBe(true);
      expect(result.version).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should parse version flag', () => {
      const parser = new ParamsParser();
      const args = ['--version'];
      const result = parser['parseNoParams'](args);
      expect(result.help).toBe(false);
      expect(result.version).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should parse both help and version flags', () => {
      const parser = new ParamsParser();
      const args = ['--help', '--version'];
      const result = parser['parseNoParams'](args);
      expect(result.help).toBe(true);
      expect(result.version).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should parse command with options', () => {
      const parser = new ParamsParser();
      const args = ['command', '--option=value'];
      const result = parser['parseNoParams'](args);
      expect(result.command).toBe('command');
      expect(result.options).toEqual(['--option=value']);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty arguments', () => {
      const parser = new ParamsParser();
      const args: string[] = [];
      const result = parser['parseNoParams'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('No arguments provided');
    });
  });

  describe('parseSingleParam', () => {
    it('should parse valid demonstrative type', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type=test'];
      const result = parser['parseSingleParam'](args);
      expect(result.demonstrativeType).toBe('test');
      expect(result.layerType).toBeUndefined();
      expect(result.options).toEqual(['--demonstrative-type=test']);
      expect(result.error).toBeUndefined();
    });

    it('should parse valid layer type', () => {
      const parser = new ParamsParser();
      const args = ['command', '--layer-type=test'];
      const result = parser['parseSingleParam'](args);
      expect(result.demonstrativeType).toBeUndefined();
      expect(result.layerType).toBe('test');
      expect(result.options).toEqual(['--layer-type=test']);
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid demonstrative type', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type=invalid'];
      const result = parser['parseSingleParam'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid demonstrative type');
    });

    it('should handle invalid layer type', () => {
      const parser = new ParamsParser();
      const args = ['command', '--layer-type=invalid'];
      const result = parser['parseSingleParam'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid layer type');
    });

    it('should handle missing parameter value', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type'];
      const result = parser['parseSingleParam'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Missing parameter value');
    });
  });

  describe('parseDoubleParams', () => {
    it('should parse valid demonstrative and layer types', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type=test1', '--layer-type=test2'];
      const result = parser['parseDoubleParams'](args);
      expect(result.demonstrativeType).toBe('test1');
      expect(result.layerType).toBe('test2');
      expect(result.options).toEqual(['--demonstrative-type=test1', '--layer-type=test2']);
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid demonstrative type', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type=invalid', '--layer-type=test'];
      const result = parser['parseDoubleParams'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid demonstrative type');
    });

    it('should handle invalid layer type', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type=test', '--layer-type=invalid'];
      const result = parser['parseDoubleParams'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid layer type');
    });

    it('should handle missing demonstrative type value', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type', '--layer-type=test'];
      const result = parser['parseDoubleParams'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Missing demonstrative type value');
    });

    it('should handle missing layer type value', () => {
      const parser = new ParamsParser();
      const args = ['command', '--demonstrative-type=test', '--layer-type'];
      const result = parser['parseDoubleParams'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Missing layer type value');
    });

    it('should handle missing both parameters', () => {
      const parser = new ParamsParser();
      const args = ['command'];
      const result = parser['parseDoubleParams'](args);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Missing required parameters');
    });
  });

  describe('error handling', () => {
    it('should handle invalid configuration', () => {
      const parser = new ParamsParser({
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '[invalid'
        }
      });
      const result = parser.parse(['to', 'project']);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.INVALID_PATTERN);
      expect(result.error?.category).toBe(ErrorCategory.CONFIGURATION);
    });

    it('should handle security error in pattern', () => {
      const parser = new ParamsParser({
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '^[a-z;]+$'
        }
      });
      const result = parser.parse(['to', 'project']);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.SECURITY_ERROR);
      expect(result.error?.category).toBe(ErrorCategory.SECURITY);
    });

    it('should handle validation error for invalid demonstrative type', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['invalid', 'project']);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.INVALID_DEMONSTRATIVE_TYPE);
      expect(result.error?.category).toBe(ErrorCategory.VALIDATION);
    });

    it('should handle validation error for invalid layer type', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['to', 'invalid']);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.INVALID_LAYER_TYPE);
      expect(result.error?.category).toBe(ErrorCategory.VALIDATION);
    });

    it('should handle syntax error for too many arguments', () => {
      const parser = new ParamsParser();
      const result = parser.parse(['to', 'project', 'extra']);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.TOO_MANY_ARGUMENTS);
      expect(result.error?.category).toBe(ErrorCategory.SYNTAX);
    });
  });

  describe('extended mode', () => {
    it('should validate with custom pattern', () => {
      const parser = new ParamsParser({
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '^[a-z]+$'
        }
      });
      const result = parser.parse(['custom', 'project']);
      expect(result.type).toBe('double');
      expect(result.demonstrativeType).toBe('custom');
      expect(result.layerType).toBe('project');
      expect(result.error).toBeUndefined();
    });

    it('should validate with custom error message', () => {
      const parser = new ParamsParser({
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '^[a-z]+$',
          errorMessage: 'Custom error message'
        }
      });
      const result = parser.parse(['123', 'project']);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Custom error message');
    });

    it('should validate both demonstrative and layer types', () => {
      const parser = new ParamsParser({
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '^[a-z]+$'
        },
        layerType: {
          pattern: '^[a-z]+$'
        }
      });
      const result = parser.parse(['custom', 'custom']);
      expect(result.type).toBe('double');
      expect(result.demonstrativeType).toBe('custom');
      expect(result.layerType).toBe('custom');
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid pattern in extended mode', () => {
      const parser = new ParamsParser({
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '[invalid'
        }
      });
      const result = parser.parse(['to', 'project']);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.INVALID_PATTERN);
    });

    it('should handle pattern with forbidden characters', () => {
      const parser = new ParamsParser({
        isExtendedMode: true,
        demonstrativeType: {
          pattern: '^[a-z;]+$'
        }
      });
      const result = parser.parse(['to', 'project']);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.SECURITY_ERROR);
    });
  });
}); 