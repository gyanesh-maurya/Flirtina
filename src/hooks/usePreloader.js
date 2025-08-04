import { useState, useEffect } from 'react';

export const usePreloader = (minimumLoadTime = 2000) => {
  const [isLoading, setIsLoading] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Function to preload critical assets
    const preloadAssets = async () => {
      const imagePromises = [
        '/main-logo.png',
        '/logo.png',
        '/favicon.svg'
      ].map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Resolve even on error to not block loading
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
      } catch (error) {
        // Some assets failed to preload, continue anyway
      }

      setAssetsLoaded(true);
    };

    // Start preloading assets
    preloadAssets();
  }, []);

  // Hide preloader when both conditions are met
  useEffect(() => {
    if (assetsLoaded) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumLoadTime - elapsed);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [assetsLoaded, minimumLoadTime, startTime]);

  const hidePreloader = () => {
    setIsLoading(false);
  };

  return { isLoading, hidePreloader };
};
