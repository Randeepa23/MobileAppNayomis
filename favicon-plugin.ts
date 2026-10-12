import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// Simple Vite plugin to inject the favicon directly into the HTML
export function faviconPlugin(): Plugin {
  return {
    name: 'vite-plugin-favicon',
    transformIndexHtml(html) {
      // Path to the logo relative to this file
      const faviconPath = path.resolve(__dirname, './src/assets/logo.jpeg');
      
      // Check if the file exists
      if (fs.existsSync(faviconPath)) {
        // Insert the favicon link into the HTML head
        return html.replace(
          /<\/head>/,
          `  <link rel="icon" href="/src/assets/logo.jpeg" />\n  </head>`
        );
      }
      
      return html;
    },
  };
}