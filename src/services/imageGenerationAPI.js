// Hugging Face FLUX.1-dev Image Generation API
export const imageGenerationAPI = {
  async generateImage(prompt) {
    try {
      // For testing purposes, let's also add a simpler stable diffusion model as fallback
      const models = [
        'black-forest-labs/FLUX.1-dev',
        'stabilityai/stable-diffusion-xl-base-1.0'
      ];
      
      let lastError = null;
      
      for (const model of models) {
        try {
          
          const response = await fetch(`/.netlify/functions/image-generation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: prompt,
              model: model,
              parameters: {
                width: 512,
                height: 512,
                num_inference_steps: 20
              }
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`API Error for ${model}:`, errorData);
            lastError = new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
            continue; // Try next model
          }

          // Parse JSON response from serverless function
          const result = await response.json();

          if (!result.success) {
            lastError = new Error(result.error || 'Image generation failed');
            continue; // Try next model
          }

          if (!result.imageData || result.imageData.length === 0) {
            lastError = new Error('Received empty image data');
            continue; // Try next model
          }

          return {
            success: true,
            imageData: result.imageData,
            prompt: prompt,
            model: result.model || model
          };
          
        } catch (modelError) {
          console.error(`Error with model ${model}:`, modelError);
          lastError = modelError;
          continue; // Try next model
        }
      }
      
      // If we get here, all models failed
      throw lastError || new Error('All image generation models failed');
      
    } catch (error) {
      console.error('Image generation error:', error);
      
      // In development mode, return a test image as fallback
      if (import.meta.env.DEV) {
        
        // Create a simple test image using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#FF6B9D');
        gradient.addColorStop(1, '#C44569');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test Image', 256, 200);
        ctx.fillText('Generated for:', 256, 240);
        ctx.font = '16px Arial';
        ctx.fillText(prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''), 256, 280);
        ctx.fillText('API temporarily unavailable', 256, 320);
        
        // Convert canvas to base64
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        return {
          success: true,
          imageData: base64,
          prompt: prompt,
          model: 'test-fallback'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to generate image'
      };
    }
  }
};
