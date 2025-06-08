import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { SecurityErrorValidator } from '../../../src/validator/security_error_validator.ts';
import { OptionRule, ValidationResult } from '../../../src/result/types.ts';

const optionRule: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['--demonstrative-type', '--layer-type'],
    emptyValue: 'error',
    unknownOption: 'error',
    duplicateOption: 'error',
    requiredOptions: [],
    valueTypes: ['string'],
  },
  flagOptions: {
    help: 'help',
    version: 'version',
  },
};

Deno.test('test_security_error_validator_implementation', () => {
  const validator = new SecurityErrorValidator(optionRule);

  // 正常系のバリデーション
  const result = validator.validate(['test']);
  assertEquals(result.isValid, true, 'Normal validation should succeed');
  assertEquals(result.validatedParams, ['test'], 'Validated params should match input');
  assertEquals(result.errors, [], 'Should have no errors');

  // シェルコマンド実行の試み
  const shellCommandResult = validator.validate(['test; ls']);
  assertEquals(shellCommandResult.isValid, false, 'Shell command attempt should fail');
  assertEquals(shellCommandResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(shellCommandResult.errorCategory, 'security', 'Should have security category');
  assertEquals(
    shellCommandResult.errorMessage,
    'Security error: Shell command execution attempt detected',
    'Should have correct error message'
  );

  // パストラバーサルの試み
  const pathTraversalResult = validator.validate(['test', '../file']);
  assertEquals(pathTraversalResult.isValid, false, 'Path traversal attempt should fail');
  assertEquals(pathTraversalResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(pathTraversalResult.errorCategory, 'security', 'Should have security category');
  assertEquals(
    pathTraversalResult.errorMessage,
    'Security error: Path traversal attempt detected',
    'Should have correct error message'
  );

  // 複数のセキュリティチェック
  const multipleChecksResult = validator.validate(['test; ls', '../file']);
  assertEquals(multipleChecksResult.isValid, false, 'Multiple security violations should fail');
  assertEquals(multipleChecksResult.errorCode, 'SECURITY_ERROR', 'Should have security error code');
  assertEquals(multipleChecksResult.errorCategory, 'security', 'Should have security category');
});
