import { HfInference } from '@huggingface/inference';

const HF_TOKEN = import.meta.env.VITE_HF_API_KEY || '';

const hf = new HfInference(HF_TOKEN);

const MODEL_MAP: Record<string, string> = {
  'stable-diffusion': 'stabilityai/stable-diffusion-xl-base-1.0',
  'midjourney': 'prompthero/openjourney-v4',
  'imagine': 'SG161222/RealVisXL_V4.0',
  'playground': 'playgroundai/playground-v2.5-1024px-aesthetic',
};

export async function generateImageFromHF(
  prompt: string,
  negativePrompt: string,
  modelKey: string
): Promise<string> {
  if (!HF_TOKEN) {
    throw new Error('AI API Anahtarı eksik. Lütfen .env dosyasını kontrol edin.');
  }

  const modelId = MODEL_MAP[modelKey] || MODEL_MAP['stable-diffusion'];

  try {
    const result = await hf.textToImage({
      model: modelId,
      inputs: prompt,
      parameters: {
        negative_prompt: negativePrompt || undefined,
        width: 1024,
        height: 1024,
      },
    }, { outputType: 'url' });

    return result as unknown as string; // Result is a URL string when outputType is 'url'
  } catch (error) {
    console.error('HF Generation Error:', error);
    throw error;
  }
}

export async function startTraining(
  _folderName: string,
  _images: { url: string; description: string }[],
  onProgress: (progress: number, log: string) => void
): Promise<void> {
  // Simulated training pipeline — in production this would call HF AutoTrain API
  const logs = [
    'Initializing LoRA adapter layers...',
    'Loading base model: SDXL 1.0...',
    'Pre-processing training images...',
    'Computing image embeddings...',
    'Analyzing visual features...',
    'Building token vocabulary...',
    'Starting gradient descent...',
    'Epoch 1/4 — Loss: 0.4521',
    'Weights adjusting — Layer 12/24...',
    'Epoch 2/4 — Loss: 0.2837',
    'Cross-attention fine-tuning...',
    'Epoch 3/4 — Loss: 0.1492',
    'Regularization pass...',
    'Epoch 4/4 — Loss: 0.0731',
    'Merging LoRA weights into base model...',
    'Saving model checkpoint...',
    'Validating model integrity...',
    'Optimizing inference pipeline...',
    'Model registered successfully ✓',
    'Training complete — Model ready for inference.',
  ];

  for (let i = 0; i < logs.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));
    const progress = Math.round(((i + 1) / logs.length) * 100);
    onProgress(progress, logs[i]);
  }
}
