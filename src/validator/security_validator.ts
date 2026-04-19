import { BaseValidator } from './params/base_validator.ts';
import type { ValidationResult } from '../types/validation_result.ts';

// 名前付き定数: マジックナンバー禁止ルール（CLAUDE.md）に従い regex を定数化
//
// SHELL_INJECTION_PATTERN:
//   シェル制御文字（`;`, `|`, `&`, `<`, `>`）を検出する。
//   全引数（`--uv-*` を含む）に適用される。
const SHELL_INJECTION_PATTERN = /[;|&<>]/;

// PATH_TRAVERSAL_PATTERN:
//   path traversal を厳密に検出するパターン。
//   - `../foo` や `..\bar` のようにスラッシュ/バックスラッシュが続く `..`
//   - 末尾が `..` で終わるもの（例: `foo/..`）
//   をマッチする。
//   `...`（三点リーダ）、`..README`、`narrative ..text` などは
//   path traversal ではなく通常テキストとして扱い、誤検知しない。
const PATH_TRAVERSAL_PATTERN = /\.\.[\/\\]|\.\.$/;

// USER_VARIABLE_PREFIX:
//   テンプレート変数オプションのプレフィックス。
//   path traversal 検査の対象外（shell injection は引き続き対象）。
const USER_VARIABLE_PREFIX = '--uv-';

/**
 * Security validator for command-line arguments.
 *
 * This validator checks for potentially harmful strings in parameters
 * that could compromise system security. It prevents command injection,
 * path traversal, and other security vulnerabilities.
 *
 * @extends BaseValidator
 *
 * @example
 * ```ts
 * const validator = new SecurityValidator();
 * const result = validator.validate(["normal", "args"]);
 * // { isValid: true, validatedParams: ["normal", "args"] }
 *
 * const dangerous = validator.validate(["rm -rf /", "; cat /etc/passwd"]);
 * // { isValid: false, errorMessage: "Security error..." }
 * ```
 */
export class SecurityValidator extends BaseValidator {
  /**
   * Creates a new SecurityValidator instance.
   */
  constructor() {
    super();
  }

  /**
   * Validates command-line arguments for security threats.
   *
   * Checks for:
   * - Shell command injection attempts (;, |, &, <, >) — applied to all arguments
   * - Path traversal attempts (../, ..\, trailing ..) — applied to all arguments
   *   except `--uv-*` user variable options, which are template variable values
   *   and not interpreted as paths
   *
   * @param args - Array of command-line arguments to validate
   * @returns Validation result with security check status
   *
   * @example
   * ```ts
   * validator.validate(["--file=../../../etc/passwd"]);
   * // { isValid: false, errorCode: "SECURITY_ERROR" }
   *
   * validator.validate(["test.txt", "--verbose"]);
   * // { isValid: true, validatedParams: [...] }
   * ```
   */
  public validate(args: string[]): ValidationResult {
    // Shell injection check: 全引数に適用（`--uv-*` を含む）
    if (args.some((arg) => SHELL_INJECTION_PATTERN.test(arg))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Shell command execution or redirection attempt detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    // Path traversal check: `--uv-*` を除外したうえで適用
    // `--uv-*` の値はテンプレート変数値であり、パスとして解釈しない
    const pathTraversalTargets = args.filter(
      (arg) => !arg.startsWith(USER_VARIABLE_PREFIX),
    );
    if (pathTraversalTargets.some((arg) => PATH_TRAVERSAL_PATTERN.test(arg))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Path traversal attempt detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    return {
      isValid: true,
      validatedParams: args,
      errors: [],
    };
  }
}
