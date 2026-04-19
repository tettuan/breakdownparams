import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../security_validator.ts';
import { BaseValidator } from '../params/base_validator.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';

const logger = new BreakdownLogger('security');

Deno.test('test_security_validator_architecture', () => {
  const validator = new SecurityValidator();
  logger.debug('SecurityValidator instance check', {
    data: { isBaseValidator: validator instanceof BaseValidator },
  });
  assert(validator instanceof BaseValidator, 'Should be instance of BaseValidator');
  assertEquals(typeof validator.validate, 'function', 'Should have validate method');
  assertEquals(
    typeof validator.validatePhase1,
    'function',
    'Should expose validatePhase1 (raw shellInjection)',
  );
  assertEquals(
    typeof validator.validatePhase2,
    'function',
    'Should expose validatePhase2 (resolved options)',
  );
});

Deno.test('test_security_validator_architecture_accepts_custom_config', () => {
  // SecurityValidator constructor must accept an optional CustomConfig so
  // ParamsParser can inject security policy configuration into the
  // validator. Without this hook, per-option `kind` and `securityPolicy`
  // can never reach Phase 2.
  const validator = new SecurityValidator(DEFAULT_CUSTOM_CONFIG);
  assert(validator instanceof BaseValidator, 'Should still be a BaseValidator');
  // Sanity: with default config, a safe input passes both phases.
  const phase1 = validator.validatePhase1(['safe_arg']);
  assert(phase1.isValid, 'Phase1 should accept safe args under default config');
});
