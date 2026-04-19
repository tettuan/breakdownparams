import { assert, assertEquals } from 'jsr:@std/assert@^0.218.2';
import { BreakdownLogger } from '@tettuan/breakdownlogger';
import { SecurityValidator } from '../security_validator.ts';
import { BaseValidator } from '../params/base_validator.ts';
import { DEFAULT_CUSTOM_CONFIG } from '../../types/custom_config.ts';

const logger = new BreakdownLogger('security');

/**
 * @purpose Architecture-tier contract: type relationships and method
 *   signatures only. No behavior is asserted here — concrete acceptance /
 *   rejection lives in 1_structure / 2_unit tiers.
 */

const REQUIRED_METHODS: ReadonlyArray<keyof SecurityValidator> = [
  'validate',
  'validatePhase1',
  'validatePhase2',
] as const;

Deno.test('test_security_validator_architecture', () => {
  const validator = new SecurityValidator();
  logger.debug('SecurityValidator instance check', {
    data: { isBaseValidator: validator instanceof BaseValidator },
  });
  assert(validator instanceof BaseValidator, 'Should be instance of BaseValidator');
  for (const method of REQUIRED_METHODS) {
    assertEquals(
      typeof validator[method],
      'function',
      `SecurityValidator must expose ${String(method)}() method (architecture contract).`,
    );
  }
});

Deno.test('test_security_validator_architecture_accepts_custom_config', () => {
  // Architecture contract: SecurityValidator constructor must accept an
  // optional CustomConfig so ParamsParser can inject security policy. Only
  // the constructor signature + instance type are asserted here; behavior
  // belongs to 2_unit tests.
  const validator = new SecurityValidator(DEFAULT_CUSTOM_CONFIG);
  assert(validator instanceof BaseValidator, 'Should still be a BaseValidator');
  for (const method of REQUIRED_METHODS) {
    assertEquals(
      typeof validator[method],
      'function',
      `SecurityValidator(CustomConfig) must still expose ${String(method)}().`,
    );
  }
});
