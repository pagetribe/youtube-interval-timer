import path from 'path';
import react from '@vitejs/plugin-react'; // Make sure the React plugin is imported
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 1. Add this line for GitHub Pages
      

      // 2. Make sure your plugins are here
      plugins: [react()], 
      
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});