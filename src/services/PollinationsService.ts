export interface PollinationsModel {
  id: string;
  name: string;
  description?: string;
}

export const POLLINATIONS_MODELS: PollinationsModel[] = [
  { id: 'flux', name: 'Flux.1 (Ultra High Quality)', description: 'Industry leading detail' },
  { id: 'turbo', name: 'Turbo Realism', description: 'Fast and realistic' },
  { id: 'unity', name: 'Unity Engine Style', description: 'Game development aesthetics' },
  { id: 'pixel', name: 'Pixel Art Generator', description: 'Retro 16-bit visuals' },
  { id: 'deliberate', name: 'Deliberate v2', description: 'Artistic and creative' },
];

export async function generateImageFromPollinations(
  prompt: string,
  model: string = 'flux',
  width: number = 1024,
  height: number = 1024
): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt);
  
  // Base Pollinations URL — No API key required for these endpoints
  // We use the model as a parameter if supported by the proxy, or default to their main engine
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
  
  // We verify the image exists/is ready by doing a head request or just return the URL
  // Pollinations generates on-the-fly when the URL is accessed.
  return url;
}
