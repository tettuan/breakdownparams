import { ParamsParser } from '../src/parser/params_parser.ts';
import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../src/types/custom_config.ts';
import type { TwoParamsResult } from '../src/types/params_result.ts';

// Custom configuration for a project management tool
const projectConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  params: {
    two: {
      // Project management actions
      directiveType: {
        pattern: '^(create|update|close|assign|prioritize|estimate|track|review)$',
        errorMessage:
          'Invalid action. Available: create, update, close, assign, prioritize, estimate, track, review',
      },
      // Project entities
      layerType: {
        pattern: '^(ticket|epic|milestone|sprint|backlog|roadmap|release|feature)$',
        errorMessage:
          'Invalid entity. Available: ticket, epic, milestone, sprint, backlog, roadmap, release, feature',
      },
    },
  },
  validation: {
    ...DEFAULT_CUSTOM_CONFIG.validation,
    two: {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input'],
      allowedValueOptions: ['from', 'destination', 'config', 'adaptation', 'input'],
      allowCustomVariables: true,
    },
  },
};

const parser = new ParamsParser(undefined, projectConfig);

// Realistic project management commands
const commands = [
  // Creating items
  ['create', 'ticket', '--from=bug-report.md', '--uv-priority=high', '--uv-assignee=john'],
  ['create', 'epic', '--from=feature-proposal.md', '--uv-quarter=Q2', '--uv-team=backend'],
  ['create', 'milestone', '--from=release-plan.md', '--destination=milestones/v2.0.md'],

  // Updating items
  ['update', 'sprint', '--from=sprint-23.json', '--uv-status=in-progress'],
  ['update', 'backlog', '--from=new-items.csv', '--adaptation=priority-based'],

  // Closing items
  ['close', 'ticket', '--from=completed-tasks.txt', '--uv-resolution=fixed'],
  ['close', 'milestone', '--from=v1.5-summary.md', '--destination=archive/'],

  // Assignment operations
  ['assign', 'feature', '--from=unassigned.json', '--uv-team=frontend', '--uv-sprint=24'],
  ['assign', 'ticket', '--from=bug-list.md', '--config=assignment-rules.json'],

  // Prioritization
  ['prioritize', 'backlog', '--from=all-items.csv', '--adaptation=business-value'],
  ['prioritize', 'sprint', '--from=sprint-backlog.json', '--uv-method=weighted-shortest-job'],

  // Estimation
  ['estimate', 'epic', '--from=requirements.md', '--uv-method=story-points'],
  ['estimate', 'release', '--from=feature-list.json', '--destination=estimates.md'],

  // Tracking
  ['track', 'sprint', '--from=current-sprint.json', '--uv-metric=velocity'],
  ['track', 'milestone', '--from=q1-goals.md', '--destination=progress-report.html'],

  // Review
  ['review', 'roadmap', '--from=annual-plan.md', '--uv-period=quarterly'],
  ['review', 'release', '--from=v2.0-plan.json', '--adaptation=stakeholder-view'],
];

console.log('=== Project Management Tool Examples ===\n');
console.log('Demonstrating a project management system with natural command syntax.\n');

for (const args of commands) {
  console.log(`$ pm ${args.join(' ')}`);
  const result = parser.parse(args);

  if (result.type === 'two') {
    const twoResult = result as TwoParamsResult;
    console.log(`✅ Executing: ${twoResult.directiveType} ${twoResult.layerType}`);

    // Show relevant options
    const options = twoResult.options;
    if (options.from) {
      console.log(`   Source: ${options.from}`);
    }
    if (options.destination) {
      console.log(`   Output: ${options.destination}`);
    }
    if (options.config) {
      console.log(`   Config: ${options.config}`);
    }
    if (options.adaptation) {
      console.log(`   Mode: ${options.adaptation}`);
    }

    // Show custom variables
    const customVars = Object.entries(options)
      .filter(([key]) => key.startsWith('uv-'))
      .map(([key, value]) => `${key.substring(3)}=${value}`);

    if (customVars.length > 0) {
      console.log(`   Parameters: ${customVars.join(', ')}`);
    }
  } else if (result.type === 'error') {
    console.log(`❌ Error: ${result.error?.message}`);
  }
  console.log('');
}

// Usage summary
console.log('=== Quick Reference ===\n');
console.log('Common workflows:\n');
console.log('1. Create high-priority bug ticket:');
console.log('   pm create ticket --from=bug.md --uv-priority=high --uv-assignee=dev\n');
console.log('2. Update sprint with new status:');
console.log('   pm update sprint --from=sprint-data.json --uv-status=active\n');
console.log('3. Prioritize backlog items:');
console.log('   pm prioritize backlog --from=items.csv --adaptation=business-value\n');
console.log('4. Track milestone progress:');
console.log('   pm track milestone --from=goals.md --destination=report.html\n');
console.log('5. Estimate epic complexity:');
console.log('   pm estimate epic --from=specs.md --uv-method=story-points');
