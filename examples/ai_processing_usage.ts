import { ParamsParser } from '../src/parser/params_parser.ts';
import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../src/types/custom_config.ts';
import type { TwoParamsResult } from '../src/types/params_result.ts';

// Custom configuration for an AI processing tool
const aiConfig: CustomConfig = {
  ...DEFAULT_CUSTOM_CONFIG,
  params: {
    two: {
      // AI processing actions
      demonstrativeType: {
        pattern: '^(train|fine-tune|evaluate|optimize|compress|deploy|benchmark|explain)$',
        errorMessage:
          'Invalid action. Use: train, fine-tune, evaluate, optimize, compress, deploy, benchmark, explain',
      },
      // Model/data types
      layerType: {
        pattern:
          '^(model|dataset|pipeline|embeddings|checkpoint|weights|architecture|predictions)$',
        errorMessage:
          'Invalid target. Use: model, dataset, pipeline, embeddings, checkpoint, weights, architecture, predictions',
      },
    },
  },
};

const parser = new ParamsParser(undefined, aiConfig);

// Realistic AI/ML commands
const aiCommands = [
  // Training examples
  [
    'train',
    'model',
    '--from=dataset.parquet',
    '--config=bert-base.json',
    '--uv-epochs=10',
    '--uv-batch-size=32',
  ],
  [
    'train',
    'embeddings',
    '--from=text-corpus.txt',
    '--destination=models/embeddings/',
    '--uv-dimensions=768',
  ],

  // Fine-tuning
  [
    'fine-tune',
    'model',
    '--from=pretrained.pt',
    '--input=custom-data.json',
    '--uv-learning-rate=0.0001',
  ],
  [
    'fine-tune',
    'checkpoint',
    '--from=base-model/',
    '--adaptation=domain-specific',
    '--uv-steps=5000',
  ],

  // Evaluation
  [
    'evaluate',
    'model',
    '--from=test-set.csv',
    '--destination=metrics.json',
    '--uv-metric=f1-score',
  ],
  ['evaluate', 'predictions', '--from=model-output.json', '--config=eval-config.yaml'],

  // Optimization
  [
    'optimize',
    'model',
    '--from=large-model.onnx',
    '--adaptation=quantization',
    '--uv-precision=int8',
  ],
  ['optimize', 'pipeline', '--from=inference-graph.pb', '--uv-target=mobile', '--uv-memory=2gb'],

  // Compression
  [
    'compress',
    'weights',
    '--from=model-weights.bin',
    '--destination=compressed/',
    '--uv-ratio=0.1',
  ],
  ['compress', 'dataset', '--from=training-data/', '--adaptation=sampling', '--uv-keep=0.2'],

  // Deployment
  [
    'deploy',
    'model',
    '--from=optimized.tflite',
    '--destination=edge-device/',
    '--uv-runtime=tensorflow-lite',
  ],
  ['deploy', 'pipeline', '--from=serving-model/', '--config=kubernetes.yaml', '--uv-replicas=3'],

  // Benchmarking
  ['benchmark', 'model', '--from=model.onnx', '--uv-device=gpu', '--uv-iterations=1000'],
  ['benchmark', 'architecture', '--from=model-def.py', '--input=sample-batch.npy'],

  // Explainability
  ['explain', 'predictions', '--from=model-results.json', '--adaptation=shap', '--uv-samples=100'],
  [
    'explain',
    'embeddings',
    '--from=vector-space.npy',
    '--destination=visualization.html',
    '--uv-method=tsne',
  ],
];

console.log('=== AI Processing Tool Examples ===\n');
console.log('Advanced AI/ML operations with intuitive command structure.\n');

for (const args of aiCommands) {
  console.log(`$ ai ${args.join(' ')}`);
  const result = parser.parse(args);

  if (result.type === 'two') {
    const twoResult = result as TwoParamsResult;
    const action = twoResult.demonstrativeType;
    const target = twoResult.layerType;

    // Create meaningful descriptions based on action and target
    let description = '';
    if (action === 'train') {
      description = `Training ${target}`;
    } else if (action === 'fine-tune') {
      description = `Fine-tuning ${target} for specific task`;
    } else if (action === 'evaluate') {
      description = `Evaluating ${target} performance`;
    } else if (action === 'optimize') {
      description = `Optimizing ${target} for deployment`;
    } else if (action === 'compress') {
      description = `Compressing ${target} to reduce size`;
    } else if (action === 'deploy') {
      description = `Deploying ${target} to production`;
    } else if (action === 'benchmark') {
      description = `Benchmarking ${target} performance`;
    } else if (action === 'explain') {
      description = `Generating explanations for ${target}`;
    }

    console.log(`✅ ${description}`);

    // Show configuration details
    const opts = twoResult.options;
    const details = [];

    if (opts.from) details.push(`source: ${opts.from}`);
    if (opts.destination) details.push(`output: ${opts.destination}`);
    if (opts.config) details.push(`config: ${opts.config}`);
    if (opts.adaptation) details.push(`method: ${opts.adaptation}`);
    if (opts.input) details.push(`data: ${opts.input}`);

    // Extract custom variables
    Object.entries(opts).forEach(([key, value]) => {
      if (key.startsWith('uv-')) {
        const param = key.substring(3).replace(/-/g, '_');
        details.push(`${param}: ${value}`);
      }
    });

    if (details.length > 0) {
      console.log(`   Settings: ${details.join(', ')}`);
    }
  } else if (result.type === 'error') {
    console.log(`❌ Error: ${result.error?.message}`);
  }
  console.log('');
}

// Practical examples section
console.log('=== Common AI Workflows ===\n');
console.log('1. Train a BERT model:');
console.log('   ai train model --from=data.csv --config=bert.json --uv-epochs=10\n');
console.log('2. Fine-tune for classification:');
console.log(
  '   ai fine-tune model --from=bert-base.pt --input=labels.json --uv-learning-rate=2e-5\n',
);
console.log('3. Optimize for mobile deployment:');
console.log('   ai optimize model --from=model.pb --adaptation=quantization --uv-target=mobile\n');
console.log('4. Deploy to production:');
console.log('   ai deploy pipeline --from=serving/ --config=k8s.yaml --uv-replicas=5\n');
console.log('5. Explain model predictions:');
console.log('   ai explain predictions --from=outputs.json --adaptation=lime --uv-samples=1000');
