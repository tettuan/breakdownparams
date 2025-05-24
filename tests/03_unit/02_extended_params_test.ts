import { assert, assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { ParamsParser } from '../../mod.ts';

// Standard mode tests
Deno.test('Standard validation rules are applied when extended mode is disabled', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['to', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'to');
    assertEquals(result.layerType, 'project');
  }
});

// Extended mode tests
Deno.test('Custom patterns are applied when extended mode is enabled', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[a-z]+$',
      errorMessage: 'Invalid demonstrative type',
    },
    layerType: {
      pattern: '^[a-z]+$',
      errorMessage: 'Invalid layer type',
    },
  });
  const result = parser.parse(['custom', 'layer']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'custom');
    assertEquals(result.layerType, 'layer');
  }
});

Deno.test('DemonstrativeType custom patterns are validated correctly', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[a-z]+$',
    },
  });
  const result = parser.parse(['custom', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'custom');
  }
});

Deno.test('LayerType custom patterns are validated correctly', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    layerType: {
      pattern: '^[a-z]+$',
    },
  });
  const result = parser.parse(['to', 'custom']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.layerType, 'custom');
  }
});

Deno.test('Invalid DemonstrativeType values are rejected', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[a-z]+$',
      errorMessage: 'Invalid demonstrative type',
    },
  });
  const result = parser.parse(['Custom', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_DEMONSTRATIVE_TYPE');
    assertEquals(result.error.category, 'VALIDATION');
    assertEquals(result.error.message, 'Invalid demonstrative type');
    assertExists(result.error.details);
    assertEquals(result.error.details.provided, 'Custom');
    assertEquals(result.error.details.pattern, '^[a-z]+$');
  }
});

Deno.test('Invalid LayerType values are rejected', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    layerType: {
      pattern: '^[a-z]+$',
      errorMessage: 'Invalid layer type',
    },
  });
  const result = parser.parse(['to', 'Custom']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_LAYER_TYPE');
    assertEquals(result.error.category, 'VALIDATION');
    assertEquals(result.error.message, 'Invalid layer type');
    assertExists(result.error.details);
    assertEquals(result.error.details.provided, 'Custom');
    assertEquals(result.error.details.pattern, '^[a-z]+$');
  }
});

Deno.test('Complex regex patterns are processed correctly', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[a-z]+_[a-z]+$',
    },
    layerType: {
      pattern: '^[a-z]+_[a-z]+$',
    },
  });
  const result = parser.parse(['custom_type', 'custom_layer']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'custom_type');
    assertEquals(result.layerType, 'custom_layer');
  }
});

Deno.test('Invalid regex patterns result in configuration error', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '[invalid',
    },
  });
  const result = parser.parse(['test', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_PATTERN');
    assertEquals(result.error.category, 'CONFIGURATION');
    assertEquals(result.error.message, 'Invalid demonstrative type pattern configuration');
    assertExists(result.error.details);
    assertEquals(result.error.details.pattern, '[invalid');
  }
});

Deno.test('Custom error messages are displayed correctly', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[a-z]+$',
      errorMessage: 'Custom error message',
    },
  });
  const result = parser.parse(['Test', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_DEMONSTRATIVE_TYPE');
    assertEquals(result.error.category, 'VALIDATION');
    assertEquals(result.error.message, 'Custom error message');
    assertExists(result.error.details);
    assertEquals(result.error.details.provided, 'Test');
    assertEquals(result.error.details.pattern, '^[a-z]+$');
  }
});

Deno.test('Empty patterns are rejected', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '',
    },
  });
  const result = parser.parse(['test', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertExists(result.error);
    assertEquals(result.error.code, 'INVALID_CONFIG');
    assertEquals(result.error.category, 'CONFIGURATION');
    assertEquals(
      result.error.message,
      'Invalid configuration: pattern is required in extended mode',
    );
    assertExists(result.error.details);
    assertEquals(result.error.details.missingField, 'pattern');
  }
});

Deno.test('Transition from standard mode to extended mode works correctly', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^(to|summary|defect|[a-z]+)$',
    },
    layerType: {
      pattern: '^(project|issue|task|[a-z]+)$',
    },
  });
  const result = parser.parse(['to', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'to');
    assertEquals(result.layerType, 'project');
  }
});

Deno.test('Transition from extended mode to standard mode works correctly', () => {
  const parser = new ParamsParser();
  const result = parser.parse(['to', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'to');
    assertEquals(result.layerType, 'project');
  }
});

Deno.test('Performance: Complex patterns are handled efficiently', () => {
  const start = performance.now();
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[a-z]+_[a-z]+_[a-z]+$',
    },
    layerType: {
      pattern: '^[a-z]+_[a-z]+_[a-z]+$',
    },
  });
  const result = parser.parse(['custom_type_value', 'custom_layer_value']);
  const end = performance.now();
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'custom_type_value');
    assertEquals(result.layerType, 'custom_layer_value');
  }
  // Performance check: should complete within 100ms
  assert(end - start < 100, 'Pattern matching took too long');
});

Deno.test('Security: Malicious patterns are rejected', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '.*',
    },
  });
  const result = parser.parse(['malicious; rm -rf /', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertExists(result.error);
    assertEquals(result.error.code, 'SECURITY_ERROR');
    assertEquals(result.error.category, 'SECURITY');
    assertEquals(
      result.error.message,
      `Security error: character ';' is not allowed in parameters`,
    );
    assertExists(result.error.details);
    assertEquals(result.error.details.forbiddenChar, ';');
  }
});

Deno.test('Security: Forbidden characters in parameters are rejected', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[a-z]+$',
    },
    layerType: {
      pattern: '^[a-z]+$',
    },
  });
  const result = parser.parse(['test;', 'project']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertExists(result.error);
    assertEquals(result.error.code, 'SECURITY_ERROR');
    assertEquals(result.error.category, 'SECURITY');
    assertEquals(
      result.error.message,
      `Security error: character ';' is not allowed in parameters`,
    );
    assertExists(result.error.details);
    assertEquals(result.error.details.forbiddenChar, ';');
  }
});

Deno.test('Whitelist pattern for DemonstrativeType and LayerType is validated correctly', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^(something|allowed|list)$',
    },
    layerType: {
      pattern: '^(something|allowed|list)$',
    },
  });
  const result = parser.parse(['allowed', 'list']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'allowed');
    assertEquals(result.layerType, 'list');
  }
});

Deno.test('Strict regex patterns are validated correctly', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^[abc]{2,3}$',
    },
    layerType: {
      pattern: '^[abc]{2,3}$',
    },
  });
  const result = parser.parse(['abc', 'abb']);
  assertEquals(result.type, 'double');
  if (result.type === 'double') {
    assertEquals(result.demonstrativeType, 'abc');
    assertEquals(result.layerType, 'abb');
  }
});

Deno.test('Standard patterns are validated correctly in extended mode', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^(to|summary|defect)$',
    },
    layerType: {
      pattern: '^(project|issue|task)$',
    },
  });

  // Test all valid combinations
  const testCases = [
    { demonstrativeType: 'to', layerType: 'project' },
    { demonstrativeType: 'to', layerType: 'issue' },
    { demonstrativeType: 'to', layerType: 'task' },
    { demonstrativeType: 'summary', layerType: 'project' },
    { demonstrativeType: 'summary', layerType: 'issue' },
    { demonstrativeType: 'summary', layerType: 'task' },
    { demonstrativeType: 'defect', layerType: 'project' },
    { demonstrativeType: 'defect', layerType: 'issue' },
    { demonstrativeType: 'defect', layerType: 'task' },
  ];

  for (const { demonstrativeType, layerType } of testCases) {
    const result = parser.parse([demonstrativeType, layerType]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, demonstrativeType);
      assertEquals(result.layerType, layerType);
    }
  }

  // Test invalid combinations
  const invalidCases = [
    { demonstrativeType: 'invalid', layerType: 'project' },
    { demonstrativeType: 'to', layerType: 'invalid' },
    { demonstrativeType: 'invalid', layerType: 'invalid' },
  ];

  for (const { demonstrativeType, layerType } of invalidCases) {
    const result = parser.parse([demonstrativeType, layerType]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      if (demonstrativeType === 'invalid') {
        assertEquals(result.error.code, 'INVALID_DEMONSTRATIVE_TYPE');
        assertEquals(result.error.category, 'VALIDATION');
        assertExists(result.error.details);
        assertEquals(result.error.details.provided, demonstrativeType);
        assertEquals(result.error.details.pattern, '^(to|summary|defect)$');
      } else {
        assertEquals(result.error.code, 'INVALID_LAYER_TYPE');
        assertEquals(result.error.category, 'VALIDATION');
        assertExists(result.error.details);
        assertEquals(result.error.details.provided, layerType);
        assertEquals(result.error.details.pattern, '^(project|issue|task)$');
      }
    }
  }
});

Deno.test('Non-standard patterns are rejected in extended mode', () => {
  const parser = new ParamsParser({
    isExtendedMode: true,
    demonstrativeType: {
      pattern: '^(custom|test|example)$',
    },
    layerType: {
      pattern: '^(custom|test|example)$',
    },
  });

  // Test standard patterns are rejected
  const standardCases = [
    { demonstrativeType: 'to', layerType: 'project' },
    { demonstrativeType: 'summary', layerType: 'issue' },
    { demonstrativeType: 'defect', layerType: 'task' },
  ];

  for (const { demonstrativeType, layerType } of standardCases) {
    const result = parser.parse([demonstrativeType, layerType]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertExists(result.error);
      assertEquals(result.error.code, 'INVALID_DEMONSTRATIVE_TYPE');
      assertEquals(result.error.category, 'VALIDATION');
      assertEquals(
        result.error.message,
        `Invalid demonstrative type: ${demonstrativeType}`,
      );
      assertExists(result.error.details);
      assertEquals(result.error.details.provided, demonstrativeType);
      assertEquals(result.error.details.pattern, '^(custom|test|example)$');
    }
  }

  // Test custom patterns are accepted
  const customCases = [
    { demonstrativeType: 'custom', layerType: 'test' },
    { demonstrativeType: 'test', layerType: 'example' },
    { demonstrativeType: 'example', layerType: 'custom' },
  ];

  for (const { demonstrativeType, layerType } of customCases) {
    const result = parser.parse([demonstrativeType, layerType]);
    assertEquals(result.type, 'double');
    if (result.type === 'double') {
      assertEquals(result.demonstrativeType, demonstrativeType);
      assertEquals(result.layerType, layerType);
    }
  }
});
