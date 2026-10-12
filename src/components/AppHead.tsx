import { useEffect } from 'react';
import logoImage from '../assets/logo.jpeg';

/**
 * AppHead component to handle app-wide settings like favicon
 * This is a React way to set favicons dynamically
 */
const AppHead = () => {
  useEffect(() => {
    // Create favicon link
    const existingLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    
    const link = existingLink || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = logoImage;
    
    if (!existingLink) {
      document.head.appendChild(link);
    }
    
    // Also set a backup favicon for browsers that need it
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = logoImage;
    document.head.appendChild(appleIcon);
  }, []);

  // This component doesn't render anything
  return null;
};

export default AppHead;