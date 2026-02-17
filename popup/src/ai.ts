import { pipeline, Pipeline } from '@xenova/transformers';

let image2Text: Pipeline | null = null;

export const initAI = async (): Promise<void> => {
  if (!image2Text) {
    console.log('🤖 Initializing Transformers.js vision model...');
    image2Text = await pipeline(
      'image-to-text',
      'Xenova/llava-v1.5-7b-hf',
      { 
        progress_callback: (data) => console.log('AI progress:', data),
        local_files_only: false 
      }
    );
    console.log('✅ Vision AI ready!');
  }
};

export const generateAltText = async (img: HTMLImageElement): Promise<string> => {
  if (!image2Text) throw new Error('AI not initialized');
  
  // Canvas → buffer conversion
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageBuffer = await new Promise<Uint8Array>((resolve) => {
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(blob!);
    });
  });
  
  const result = await image2Text(imageBuffer, {
    max_new_tokens: 30,
    do_sample: true,
    temperature: 0.7
  }) as any;
  
  // Clean up response
  const description = result[0].generated_text
    .replace(/^A screenshot.*?\.\s*/i, '')
    .replace(/^\d+\.\s*/, '')
    .trim()
    .substring(0, 100);
    
  return description || 'AI-generated image description';
};