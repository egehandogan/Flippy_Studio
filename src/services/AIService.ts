const HF_TOKEN = import.meta.env.VITE_HF_API_KEY;
const MODEL_ID = 'stabilityai/stable-diffusion-xl-base-1.0';

export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${MODEL_ID}`,
    {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  const result = await response.blob();
  return URL.createObjectURL(result);
}
