import React, { useState } from 'react';

const GeneratedImage = ({ imageData, prompt, isGenerating }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (isGenerating) {
    return (
      <div className="image-generation-status">
        <div className="image-generation-spinner"></div>
        <span>Generating {prompt}...</span>
      </div>
    );
  }

  if (!imageData) {
    return null;
  }

  const handleImageClick = () => {
    // Open image in new tab for full view
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head><title>Generated Image - ${prompt}</title></head>
        <body style="margin:0;padding:20px;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
          <img src="data:image/jpeg;base64,${imageData}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${prompt}" />
        </body>
      </html>
    `);
  };

  const handleDownload = async () => {
    if (isDownloading) return; // Prevent multiple clicks
    
    setIsDownloading(true);
    
    try {
      
      // Method 1: Try using fetch to convert base64 to blob (more reliable)
      const dataUrl = `data:image/jpeg;base64,${imageData}`;
      
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        // Create download link with blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `flirtina-generated-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        return;
      } catch (blobError) {
      }
      
      // Method 2: Fallback to direct data URL method
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `flirtina-generated-${Date.now()}.jpg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Force click with user interaction
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      link.dispatchEvent(clickEvent);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Method 3: Final fallback - open in new window for manual save
      try {
        const newWindow = window.open();
        newWindow.document.write(`
          <html>
            <head><title>Download Image - ${prompt}</title></head>
            <body style="margin:0;padding:20px;background:#f0f0f0;text-align:center;">
              <h3>Right-click the image below and select "Save image as..."</h3>
              <img src="data:image/jpeg;base64,${imageData}" style="max-width:100%;border:1px solid #ccc;" alt="${prompt}" />
              <p><em>Prompt: ${prompt}</em></p>
            </body>
          </html>
        `);
      } catch (windowError) {
        alert('Download failed. Please try right-clicking the image and selecting "Save image as..."');
        console.error('All download methods failed:', windowError);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Validate base64 data before rendering
  if (!imageData || typeof imageData !== 'string' || imageData.length === 0) {
    return (
      <div className="image-generation-status">
        <span>❌ Invalid image data received</span>
      </div>
    );
  }

  return (
    <div className="generated-image-container">
      <img
        src={`data:image/jpeg;base64,${imageData}`}
        alt={prompt}
        className="generated-image"
        onClick={handleImageClick}
        onContextMenu={(e) => {
          // Add custom context menu option
          e.preventDefault();
          const confirmed = confirm('Would you like to download this image?');
          if (confirmed) {
            handleDownload();
          }
        }}
        style={{ cursor: 'pointer' }}
        title="Click to view full size • Right-click to download"
        onError={(e) => {
          console.error('Image failed to load:', e);
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      <div style={{ display: 'none', padding: '20px', textAlign: 'center', color: 'red' }}>
        ❌ Failed to load image
      </div>
      <div className="image-prompt-text">
        <div style={{ marginBottom: '8px' }}>
          <strong>Prompt:</strong> {prompt}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              background: isDownloading ? 'var(--color-border)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: isDownloading ? 0.6 : 1
            }}
            title={isDownloading ? "Downloading..." : "Download image"}
          >
            {isDownloading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Downloading...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </>
            )}
          </button>
          <button
            onClick={handleImageClick}
            style={{
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="View full size"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6"/>
              <path d="M10 14 21 3"/>
              <path d="M21 10v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/>
            </svg>
            Full Size
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImage;
